
enum Themes {
    Light = 'light',
    Dark = 'dark',
}

const configuration = {
    site: {
        name: 'Mantine Dashboard',
        description: '',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    },
    production: process.env.NODE_ENV === 'production',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
    enableThemeSwitcher: true,
    features: {
    },
    theme: Themes.Light,
    paths: {
        
    },
    env: {

    }
};

export default configuration;

