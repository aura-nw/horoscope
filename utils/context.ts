import { PrismaClient } from "@prisma/client";
import { Config } from "../common";

export const prismaAuraTestnet = new PrismaClient({
    datasources: {
        db: {
            url: Config.DATABASE_URL_AURA_TESTNET,
        }
    },
    log: ['query', 'info', 'warn', 'error']
});
export const prismaSerenityTestnet = new PrismaClient({
    datasources: {
        db: {
            url: Config.DATABASE_URL_SERENITY_TESTNET,
        }
    },
    log: ['query', 'info', 'warn', 'error']
});
export const prismaEuphoriaTestnet = new PrismaClient({
    datasources: {
        db: {
            url: Config.DATABASE_URL_EUPHORIA_TESTNET,
        }
    },
    log: ['query', 'info', 'warn', 'error']
});
export const prismaThetaTestnet = new PrismaClient({
    datasources: {
        db: {
            url: Config.DATABASE_URL_THETA_TESTNET,
        }
    },
    log: ['query', 'info', 'warn', 'error']
});
export const prismaEvmosTestnet = new PrismaClient({
    datasources: {
        db: {
            url: Config.DATABASE_URL_EVMOS_TESTNET,
        }
    },
    log: ['query', 'info', 'warn', 'error']
});
export const prismaEuphoriaProd = new PrismaClient({
    datasources: {
        db: {
            url: Config.DATABASE_URL_EUPHORIA_PROD,
        }
    },
    log: ['query', 'info', 'warn', 'error']
});
export const prismaCosmoshubProd = new PrismaClient({
    datasources: {
        db: {
            url: Config.DATABASE_URL_COSMOSHUB_PROD,
        }
    },
    log: ['query', 'info', 'warn', 'error']
});
export const prismaOsmosisProd = new PrismaClient({
    datasources: {
        db: {
            url: Config.DATABASE_URL_OSMOSIS_PROD,
        }
    },
    log: ['query', 'info', 'warn', 'error']
});

export interface Context {
    prismaAuraTestnet: PrismaClient;
    prismaSerenityTestnet: PrismaClient;
    prismaEuphoriaTestnet: PrismaClient;
    prismaThetaTestnet: PrismaClient;
    prismaEvmosTestnet: PrismaClient;
    prismaEuphoriaProd: PrismaClient;
    prismaCosmoshubProd: PrismaClient;
    prismaOsmosisProd: PrismaClient;
}

export const context: Context = {
    prismaAuraTestnet,
    prismaSerenityTestnet,
    prismaEuphoriaTestnet,
    prismaThetaTestnet,
    prismaEvmosTestnet,
    prismaEuphoriaProd,
    prismaCosmoshubProd,
    prismaOsmosisProd,
};

export enum CHAIN_ID_DEV {
    AURA_TESTNET = 'aura-testnet',
    SERENITY_TESTNET = 'serenity-testnet-001',
    EUPHORIA_TESTNET = 'euphoria-1',
    THETA_TESTNET = 'theta-testnet-001',
    EVMOS_TESTNET = 'evmos_9000-4',
};

export enum CHAIN_ID_PROD {
    EUPHORIA = 'euphoria-1',
    COSMOSHUB = 'cosmoshub-4',
    OSMOSIS = 'osmosis-1',
};

export enum ENV_NAMESPACE {
    DEV = 'horoscope_dev_api_gateway',
    STAGING = 'crawl-staging-api-gateway',
    PROD = 'crawl-system-euphoria'
}