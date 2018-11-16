module.exports = {
    apps: [{
        name: 'AccessToken',
        script: 'appCenterControl.js',
        output : './logs/appCenterControl_out.log',
        error : './logs/appCenterControl_error.err',
        log_date_format: 'YYYY-MM-DD HH:mm Z',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }],

    deploy: {
        // production : {
        //   user : 'node',
        //   host : '212.83.163.1',
        //   ref  : 'origin/master',
        //   repo : 'git@github.com:repo.git',
        //   path : '/var/www/production',
        //   'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
        // }
    }
};
