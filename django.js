const { Container, Service } = require('@quilt/quilt');

/**
 * Creates a replicated Django web service connected to MongoDB.
 * @param {number} nWorker - The desired number of Django replicas.
 * @param {string} image - The image for the Django application.
 * @param {Service} mongo - The MongoDB service to connect Django to.
 * @param {Object} [env] - The environment variables to set in the Django
 *    containers. A map from variable name to value.
 */
function Django(nWorker, image, mongo, envArg = {}) {
  const env = envArg;
  env.MONGO_URI = mongo.uri('django-example');

  const containers = new Container(image).withEnv(env).replicate(nWorker);
  this.app = new Service('app', containers);

  this.connect(mongo.port, mongo);
}

Django.prototype.deploy = function deploy(deployment) {
  deployment.deploy(this.services());
};

Django.prototype.services = function services() {
  return [this.app];
};

Django.prototype.connect = function connect(port, to) {
  const self = this;
  to.services().forEach((service) => {
    self.app.connect(port, service);
  });
};

module.exports = Django;
