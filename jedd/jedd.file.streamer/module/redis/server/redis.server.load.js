module.exports = function (core)
 {
  core.redis.client = core.redis.createClient();

  core.redis.client.select(2);

  core.promise.promisifyAll(core.redis.RedisClient.prototype);
  core.promise.promisifyAll(core.redis.Multi.prototype);

 };
