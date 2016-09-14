const trello = require('superagent');
const trelloApi = require('superagent-prefix')('https://api.trello.com/1');
const config = require('./../config/config.js');
const auth = {
  key: config.trello.key,
  token: config.trello.token
};

function CardHistory (data) {
  if(data.idShort) { this.cardNo = data.idShort; }
  if(data.idList) { this.listId = data.idList; }
}

CardHistory.scrapeTrello = () =>
  new Promise((resolve, reject) => {
    trello
    .get(`/boards/${config.trello.board}/cards`)
    .query(Object.assign({}, auth, {
      fields: 'idShort,idLabels,idList'
    }))
    .use(trelloApi)
    .accept('application/json')
    .end((err, res) => {
      if(err) {
        reject(err);
        return;
      }
      resolve(res.body
        .filter(ch => ch.idLabels.some(l => l === config.trello.label))
        .map(ch => new CardHistory(ch)));
    });
  });

module.exports = CardHistory;
