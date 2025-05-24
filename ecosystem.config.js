module.exports = {
  apps: [{
    name: "dashboards-vpn",
    script: "simple-server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "200M",
    env: {
      NODE_ENV: "production",
      PORT: 8080
    }
  }]
};
