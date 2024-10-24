const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();

// 如果用于生产环境，建议通过 CORS 限制仅允许你的域名访问
const cors = require('cors');
const corsOptions = {
 origin: '*' // 允许访问的域名
};
app.use(cors(corsOptions));

// 如果需要限制访问来源 IP，可以使用 express-ipfilter 等 express 组件：https://www.npmjs.com/package/express-ipfilter
// const ipFilter = require('express-ipfilter').IpFilter
// let ipList = []; // 允许或禁止的IP列表
// app.use(ipFilter(ipList, {
//   mode: 'allow', // allow or deny
//   trustProxy: true
// }));

app.use(express.static(__dirname + `${process.env.STATIC_DIR}`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const port = process.env.PORT || 9000;

app.post('/chat', (req, res) => {
  // 从req.body中取得prompt内容
  const prompt = req.body.prompt;
  const sessionId = req.body.sessionId || null;

  const postData = JSON.stringify({
    input: {
      prompt: prompt,
      session_id: sessionId
    },
    parameters: {
      incremental_output: true
    },
    debug: {}
  });

  const options = {
    hostname: 'dashscope.aliyuncs.com',
    path: `/api/v1/apps/${process.env.BAILIAN_APP_ID}/completion`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BAILIAN_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'X-DashScope-SSE': 'enable'
    },
  };

  const externalReq = https.request(options, (externalRes) => {
    externalRes.setEncoding('utf8');

    externalRes.on('data', (chunk) => {
      console.log(chunk);
      res.write(chunk);
    });

    externalRes.on('end', () => {
      // 当接收完外部API的响应后，将结果返回给客户端
      res.end()
    });

    res.on('close', () => {
      // Perform cleanup actions here if needed
      externalRes.socket.end();
    });
  });

  externalReq.on('error', (error) => {
    console.error(error);
    res.status(500).send("出错了");
  });

  // 发送请求到外部API
  externalReq.write(postData);
  externalReq.end();
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
