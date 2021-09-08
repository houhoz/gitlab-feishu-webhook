var http = require('http')
const axios = require('axios')
var createHandler = require('gitlab-webhook-handler')
var handler = createHandler({ path: '/incoming', secret: 'gFu7_Xyhh4m_8cb' })

const botUrl =
  'https://open.feishu.cn/open-apis/bot/v2/hook/cdf29402-a8af-441c-96c7-9cc5c7aa1359'

function send(type, event) {
  // console.log(`event.payload`, event.payload)
  let params = null
  switch (type) {
    case 'push':
      params = {
        msg_type: 'post',
        content: {
          post: {
            zh_cn: {
              title: `仓库${event.payload.repository.name}有新的推送`,
              content: [
                [
                  {
                    tag: 'text',
                    un_escape: true,
                    text: `Received a push event for ${event.payload.repository.name} to `,
                  },
                  {
                    tag: 'a',
                    text: event.payload.ref,
                    href: event.payload.commits[0].url,
                  },
                ],
              ],
            },
          },
        },
      }
      break
    case 'issue':
      params = {
        msg_type: 'post',
        content: {
          post: {
            zh_cn: {
              title: `仓库${event.payload.repository.name}议题更新`,
              content: [
                [
                  {
                    tag: 'text',
                    un_escape: true,
                    text: `Received a issue event for ${event.payload.object_attributes.title} : `,
                  },
                  {
                    tag: 'a',
                    text: event.payload.object_attributes.description,
                    href: event.payload.object_attributes.url,
                  },
                ],
                [
                  {
                    tag: 'text',
                    text: '第二行 : 请查收',
                  },
                ],
              ],
            },
          },
        },
      }
      break
    case 'note':
      params = {
        msg_type: 'post',
        content: {
          post: {
            zh_cn: {
              title: `议题${event.payload.issue.title}有新的评论`,
              content: [
                [
                  {
                    tag: 'text',
                    un_escape: true,
                    text: `Received an note event for ${event.payload.issue.title} : `,
                  },
                  {
                    tag: 'a',
                    text: event.payload.object_attributes.note,
                    href: event.payload.object_attributes.url,
                  },
                ],
                [
                  {
                    tag: 'text',
                    text: '第二行 : 请查收',
                  },
                ],
              ],
            },
          },
        },
      }
      break
    default:
      break
  }
  axios.post(botUrl, params).then(() => {})
}

http
  .createServer(function (req, res) {
    handler(req, res, function (err) {
      res.statusCode = 404
      res.end('no such location')
    })
  })
  .listen(6666)

console.log('Gitlab Hook Server running at http://0.0.0.0:6666/incoming')

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  console.log('Received a push event')
  send('push', event)
})

handler.on('issue', function (event) {
  console.log('Received a issue event')
  send('issue', event)
})

handler.on('note', function (event) {
  console.log('Received a note event ')
  send('note', event)
})
