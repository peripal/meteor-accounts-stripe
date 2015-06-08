"use strict";
Package.describe({
  summary: "Login service for stripe accounts",
  name: "dancaws:accounts-stripe",
  version: "0.0.4"
});

Npm.depends({
  "stripe": "3.0.2"
});

Package.onUse(function(api) {
  api.use('accounts-base', ['client', 'server']);
  api.imply('accounts-base', ['client', 'server']);
  api.use('accounts-oauth', ['client', 'server']);

  api.use('oauth', ['client', 'server']);
  api.use('oauth2', ['client', 'server']);
  api.use('http', ['server']);
  api.use('underscore', 'server');
  api.use('templating', 'client');
  api.use('random', 'client');
  api.use('url', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.addFiles(['lib/stripe_configure.html',
      'lib/stripe_configure.js',
      'lib/stripe_login_button.css'
    ],
    'client');

  api.addFiles('lib/stripe_client.js', 'client');
  api.addFiles('lib/stripe_server.js', 'server');
  api.addFiles("lib/accounts_stripe.js");
});
