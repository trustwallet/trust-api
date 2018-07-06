interface Logo {
    src: string;
    width: string;
    height: string;
    ipfs_hash: string;
}

interface Support {
    email: string;
    url: string;
}

interface Social {
    blog: string;
    chat: string;
    facebook: string;
    forum: string;
    github: string;
    gitter: string;
    instagram: string;
    linkedin: string;
    reddit: string;
    slack: string;
    telegram: string;
    twitter: string;
    youtube: string;
}

export interface ITokenInfo {
    symbol: string;
    address: string;
    decimals: number;
    name: string;
    ens_address: string;
    website: string;
    logo: Logo;
    support: Support;
    social: Social;
}
