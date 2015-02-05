Stripe = {};

Stripe.requestCredential = function (options, credentialRequestCompleteCallback) {

    if (!credentialRequestCompleteCallback && typeof options === 'function') {
        credentialRequestCompleteCallback = options;
        options = {};
    }

    var config = ServiceConfiguration.configurations.findOne({service: 'stripe'});
    if (!config) {
        credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError("Service not configured"));
        return;
    }

    var credentialToken = Random.secret();
    var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    var display = mobile ? 'touch' : 'popup';
    var scope = config.scope || 'read_write';
    var dimensions = {width: 600, height: 600};

    var loginStyle = OAuth._loginStyle('stripe', config, options);

    //Stripe has a ton of extra options you can pass that fill in the form that new users are presented with
    //optionally the user can pass an object with those as documented in https://stripe.com/docs/connect/reference
    var userCreateOptions = options && options.userCreateOptions || {};

    if (options && options.requestPermissions) {
        scope = options.requestPermissions.join(',');
    }
    var loginUrl =
        'https://connect.stripe.com/oauth/authorize' +
        		'?response_type=code' +
            '&scope=' + scope +
            '&client_id=' + config.appId +
            '&redirect_uri=' + Meteor.absoluteUrl('_oauth/stripe?close=close', { secure: config.useHTTPS || false }) +
            '&state=' + OAuth._stateParam(loginStyle, credentialToken);

    if (userCreateOptions) {
        loginUrl += '&' + URL._encodeParams(userCreateOptions);
    }

    Oauth.initiateLogin(credentialToken, loginUrl, credentialRequestCompleteCallback, dimensions);
};
