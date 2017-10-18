const { Container } = require('kelda');

/**
 * Creates a replicated Django web service connected to MongoDB.
 * @param {number} nWorker - The desired number of Django replicas.
 * @param {string} image - The image for the Django application.
 * @param {Mongo} mongo - The MongoDB service to connect Django to.
 * @param {Object} [env] - The environment variables to set in the Django
 *    containers. A map from variable name to value.
 */
function Django(nWorker, image, mongo, env = {}) {
  const envWithMongo = { MONGO_URI: mongo.uri('django-example') };
  Object.assign(envWithMongo, env);

  this.containers = [];
  for (let i = 0; i < nWorker; i += 1) {
    this.containers.push(new Container('django-poll', image).withEnv(envWithMongo));
  }
  mongo.allowFrom(this.containers, mongo.port);
}

Django.prototype.deploy = function deploy(deployment) {
  this.containers.forEach(container => container.deploy(deployment));
};

module.exports = Django;
