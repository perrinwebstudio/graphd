/**
 * INFORMATION SECURITY WARNING: All this settings will be available on client side
 * in other words, they will be public.
 *
 * So, do not insert here any sensitive information.
 */

// TODO: make this part of webpack then we can use environment variables from the build machine
const config = {
    serverUrl: 'https://graphd-api-tbpyudwoba-uc.a.run.app/' /*'http://35.208.174.174/' process.env.SERVER_URL || 'http://35.208.174.174/'  */,
    logLevel: /*process.env.LOG_LEVEL ||*/ 'DEBUG',
};

export default config;
