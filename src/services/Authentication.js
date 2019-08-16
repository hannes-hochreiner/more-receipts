import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

export default class Authentication {
  constructor(ps) {
    this._ps = ps;
    this._userPoolId = 'eu-central-1_hE8G4yTib';
    this._clientId = '342bgnllo00atq3hcmb03nrvts';
    this._ps.subscribe('sys.getIdToken.request', this._getIdToken.bind(this));
    this._ps.subscribe('sys.logout.request', this._logout.bind(this));
  }

  _logout() {
    let userPool = new CognitoUserPool({
      UserPoolId : this._userPoolId,
      ClientId : this._clientId
    });

    if (userPool.getCurrentUser()) {
      userPool.getCurrentUser().signOut();
    }

    this._ps.publish(`sys.logout.response`, { ok: true });
  }

  _getCurrentIdToken() {
    return new Promise((resolve, reject) => {
      let userPool = new CognitoUserPool({
        UserPoolId : this._userPoolId,
        ClientId : this._clientId
      });

      userPool.getCurrentUser().getSession((error, session) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(session.getIdToken().jwtToken);
      });
    });
  }

  async _authenticate() {
    try {
      let credentials = await this._getCredentials();
      return await this._sendAuthenticationRequest(credentials);  
    } catch (error) {
      if (typeof error != typeof NewPasswordRequiredError) {
        throw error;
      }

      let newPassword = await this._getNewPassword();
      let userAttributes = error.userAttributes;
      delete userAttributes.email_verified;

      return await this._sendNewPassword(newPassword, error.cognitoUser, error.userAttributes);
    }
  }

  async _getIdToken() {
    let idToken;

    try {
      try {
        idToken = this._getCurrentIdToken();
      } catch (error) {
        idToken = this._authenticate();
      }

      this._ps.publish(`sys.getIdToken.response`, {
        ok: true,
        idToken: idToken
      });
    } catch (error) {
      this._ps.publish(`sys.getIdToken.response`, {
        error: error
      });
    }
  }

  _getNewPassword() {
    return new Promise(function(resolve, reject) {
      let token = this._ps.subscribe('sys.getNewPassword.response', function(topic, data) {
        this._ps.unsubscribe(token);

        if (!data.ok || !data.newPassword) {
          reject(data);
        }

        resolve(data.newPassword);
      }.bind(this));
      this._ps.publish('sys.getNewPassword.request');
    }.bind(this));
  }

  _getCredentials() {
    return new Promise(function(resolve, reject) {
      let token = this._ps.subscribe('sys.getCredentials.response', function (topic, data) {
        this._ps.unsubscribe(token);

        if (!data.ok || !data.credentials) {
          reject(data);
        }

        resolve(data.credentials);
      }.bind(this));
      this._ps.publish('sys.getCredentials.request');
    }.bind(this));
  }

  async _sendAuthenticationRequest(credentials) {
    return new Promise(function(resolve, reject) {
      let authenticationDetails = new AuthenticationDetails({
          Username : credentials.username,
          Password : credentials.password,
      });
      let userPool = new CognitoUserPool({
        UserPoolId : this._userPoolId,
        ClientId : this._clientId
      });
      let userData = {
          Username : credentials.username,
          Pool : userPool
      };
      let cognitoUser = new CognitoUser(userData);

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          // User authentication was successful
          resolve(result.getIdToken().jwtToken);
        },
        onFailure: function(err) {
          // User authentication was not successful
          reject(err);
        },
        newPasswordRequired: function(userAttributes, requiredAttributes) {
          // User was signed up by an admin and must provide new
          // password and required attributes, if any, to complete
          // authentication.
          reject(new NewPasswordRequiredError(cognitoUser, userAttributes, requiredAttributes));
        }
      });
    });
  }

  async _sendNewPassword(newPassword, cognitoUser, userAttributes) {
    return new Promise(function(resolve, reject) {
      cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
        onSuccess: function (session) {
          resolve(session.getIdToken().jwtToken);
        },
        onFailure: function (err) {
          reject(err);
        }
      });
    });
  }
}

class NewPasswordRequiredError extends Error {
  constructor(cognitoUser, userAttributes, requiredAttributes) {
    super('new password required');
    this.name = 'NewPasswordRequiredError';
    this._cognitoUser = cognitoUser;
    this._userAttributes = userAttributes;
    this._requiredAttributes = requiredAttributes;
  }

  get userAttributes() {
    return this._userAttributes;
  }

  get requiredAttributes() {
    return this._requiredAttributes;
  }

  get cognitoUser() {
    return this._cognitoUser;
  }
}