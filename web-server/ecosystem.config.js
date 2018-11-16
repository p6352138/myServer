module.exports = {
    apps: [{
        name: 'ServerList_OnlineNum',
        script: 'app.js',
        output : './logs/app_out.log',
        error : './logs/app_error.err',
        log_date_format: 'YYYY-MM-DD HH:mm Z',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }, {
        name: 'Login_Update',
        script: 'appDbUpdate.js',
        output : './logs/appDbUpdate_out.log',
        error : './logs/appDbUpdate_error.err',
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
