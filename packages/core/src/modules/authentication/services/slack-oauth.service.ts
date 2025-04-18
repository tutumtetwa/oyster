import { slack } from '@/modules/slack/instances';
import { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } from '@/shared/env';
import {
  type ExchangeCodeForTokenInput,
  type OAuthService,
} from '../oauth.service';

export class SlackOAuthService implements OAuthService {
  async exchangeCodeForToken(input: ExchangeCodeForTokenInput) {
    const { access_token, refresh_token } = await slack.openid.connect.token({
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      code: input.code,
      redirect_uri: input.redirectUrl,
    });

    return {
      accessToken: access_token || '',
      refreshToken: refresh_token || '',
    };
  }

  async getProfile(token: string) {
    const { email } = await slack.openid.connect.userInfo({
      token,
    });

    if (!email) {
      throw Error('Could not find Slack profile from token.');
    }

    return {
      email,
    };
  }
}
