export interface IConfig {
  environment: string;
  partnerApiBaseUrl: string;
  pubnub: {
    publishKey: string;
    subscribeKey: string;
  };
}

const config: IConfig = {
  environment: process.env.ENV || process.env.NEXT_PUBLIC_ENV || "",
  partnerApiBaseUrl:
    process.env.PARTNER_API_BASE_URL || "http://localhost:1212",
  pubnub: {
    publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUB_KEY || "",
    subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUB_KEY || "",
  },
};

export { config };
