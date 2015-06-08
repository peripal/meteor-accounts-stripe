/* global Stripe:true, Oauth, ServiceConfiguration */
/* jshint strict:false, camelcase:false */

Stripe = {};
var StripeAPI = Npm.require('stripe');

Oauth.registerService('stripe', 2, null, function(query) {

    var response    = getTokenResponse(query);
    var accessToken = response.accessToken;


    var serviceData = {
        accessToken: accessToken,
        stripe_publishable_key: response.stripe_publishable_key,
        id: response.stripe_user_id

    };

    var stripe = StripeAPI(response.stripe_publishable_key);
    var retrieve = Meteor.wrapAsync(stripe.account.retrieve, stripe.account);

    var whiteListed = ['default_currency', 'country', 'email', 'timezone', 'business_name', 'id', 'display_name'];
    try {
      var customer = retrieve.call(Meteor, accessToken);
      var fields = _.pick(customer, whiteListed);
      _.extend(serviceData, fields);
    }
    catch (error) {
      console.log("Failed to call stripe retrieve account API: ", error.reason);
      //after that ignore the error
    }

    return {
        serviceData: serviceData,
        //No name avail from stripe, so no obvious stuff to put in the profile
    };
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
var getTokenResponse = function (query) {
    var config = ServiceConfiguration.configurations.findOne({service: 'stripe'});
    if (!config) {
        throw new ServiceConfiguration.ConfigError("Service not configured");
    }

    var responseContent;

    try {
        // Request an access token
        responseContent = HTTP.post(
            "https://connect.stripe.com/oauth/token", {
                params: {
                    client_id:     config.appId,
                    client_secret: config.secret,
                    code:          query.code,
                    grant_type: 	'authorization_code',
                    redirect_uri: Meteor.absoluteUrl("_oauth/stripe?close", { secure: config.useHTTPS || false })
                }
            }).content;

    } catch (err) {
        throw _.extend(new Error("Failed to complete OAuth handshake with stripe. " + err.message),
            {response: err.response});
    }
    // Success!  Extract the stripe access token and key
    // from the response
    var parsedResponse = JSON.parse(responseContent);

    var stripeAccessToken = parsedResponse.access_token;
    var stripe_id = parsedResponse.stripe_user_id;
    var stripe_publishable_key = parsedResponse.stripe_publishable_key;

    if (!stripeAccessToken) {
        throw new Error("Failed to complete OAuth handshake with stripe " +
           "-- can't find access token in HTTP response. " + responseContent);
    }
    return {
        accessToken: stripeAccessToken,
        stripe_user_id: stripe_id,
        stripe_publishable_key: stripe_publishable_key
    };
};


Stripe.retrieveCredential = function(credentialToken) {
    return Oauth.retrieveCredential(credentialToken);
};
