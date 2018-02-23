const express = require('express');
const Twitter = require('twitter');

const privateKeys = require('../.privateKeys');

const router = express.Router();

const omitField = tweet => ({
  id: tweet.id,
  // text: tweet.text,
  // createdAt: tweet.created_at,
  name: tweet.user.screen_name,
  media: tweet.extended_entities
    ? tweet.extended_entities.media.map(item => item.media_url.split('http://pbs.twimg.com/media/')[1])
    : null,
});

const onlyHasMedia = (tweet) => {
  if (tweet && tweet.extended_entities && tweet.extended_entities.media) {
    return true;
  }
  return false;
};

router.get('/', (req, res, next) => {
  const twitter = new Twitter({
    consumer_key: privateKeys.consumerKey,
    consumer_secret: privateKeys.consumerSecret,
    access_token_key: privateKeys.accessTokenKey,
    access_token_secret: privateKeys.accessTokenSecret,
    callback: 'http://google.com',
  });

  twitter
    .get('favorites/list', req.query)
    .then((fav) => {
      res.status(200).json(fav.filter(onlyHasMedia).map(omitField));
    });
});

module.exports = router;
