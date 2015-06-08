Accounts.oauth.registerService('stripe');

if (Meteor.isClient) {
    Meteor.loginWithStripe = function(options, callback) {
        // support a callback without options
        if (! callback && typeof options === "function") {
            callback = options;
            options = null;
        }

        var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
        Stripe.requestCredential(options, credentialRequestCompleteCallback);
    };
} else {
    var fields = ['services.stripe.email', 'services.stripe.id'];
    Accounts.addAutopublishFields({
        forLoggedInUser: fields,
        forOtherUsers: ['services.stripe.id']
    });
}
