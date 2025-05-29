import express from 'express'
const app = express()
const port = 3200
import mongoose from 'mongoose'
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session'
import http from 'http'
import { Server }  from'socket.io';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
const server = http.createServer(app);
const io = new Server(server);
const sessionMiddleware = session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: true
});
app.use(sessionMiddleware);
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});
const userSocketMap = {};
io.on('connection', (socket) => {
    const session = socket.request.session;
    if (session.user) {
        const userId = session.user.id;
        userSocketMap[userId] = socket.id;
       

        socket.on('sendMessage', async (data) => {
            const { message, idUser } = data;
            const newMsg = await messageModel.create({
                idUserSend: userId,
                idUserReceive: idUser,
                message
            });

            const fullMsg = await messageModel.findById(newMsg._id).lean();

            // Gửi cho người gửi
            socket.emit('newMessage', {
                ...fullMsg,
                isMe: true
            });

            // Gửi cho người nhận nếu đang online
            const receiverSocketId = userSocketMap[idUser];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newMessage', {
                    ...fullMsg,
                    isMe: false
                });
            }
        });
    }
});
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://nemcuaa1:n4uEFLbYEx8yaG7N@cluster0.03atdbi.mongodb.net/chatweb?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("connect to mongo")
    })
    .catch(() => {
        console.log("connect fail to mongo")
    })

let usersSchema = mongoose.Schema({
    userName: { type: String, unique: true },
    password: { type: String }
})
let usersModel = mongoose.model("User", usersSchema)



let messageSchema = mongoose.Schema({
    idUserSend: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    idUserReceive: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String }
},
    {
        timestamps: true 
    }
)
let messageModel = mongoose.model("Message",messageSchema )



app.get('/', async (req, res) => {
    if (req.session.user) {
        const messages = await messageModel.find().lean();
        const allUsers = await usersModel.find().lean();
        res.render("page/index.ejs", {
            currentUser: req.session.user,
            messages,
            allUsers
        });
    } else {
        res.redirect("/login")
    }
})
app.get('/login', (req, res) => {
    res.render("page/login.ejs")
})
app.post('/login', async (req, res) => {
    const { userName, password } = req.body;
    console.log({ userName, password })
    try {
        const user = await usersModel.findOne({ userName, password });
        if (user) {
            req.session.user = {
                id: user._id,
                userName: user.userName
            };
            res.redirect("/");
        } else {
            res.send("Sai thông tin đăng nhập");
        }
    } catch (error) {
        console.error(error);
        res.send("Lỗi khi đăng nhập");
    }
});
app.get('/register', (req, res) => {
    res.render("page/register.ejs")
})

app.post('/register', async (req, res) => {
    let { userName, password } = req.body
    try {
        const user = new usersModel({ userName, password });
        await user.save()
        res.redirect("/login")
    } catch (error) {
        res.send("co loi roi")
    }
})
app.get('/messages/:idUser', async (req, res) => {
    const myId = req.session.user.id;
    const otherId = req.params.idUser;
  
    const messages = await messageModel.find({
      $or: [
        { idUserSend: myId, idUserReceive: otherId },
        { idUserSend: otherId, idUserReceive: myId }
      ]
    }).lean();
  
    res.json(messages);
  });
app.post("/send-messages", async (req, res) => {
    if (req.session.user) {
        try {
            let { message, idUser } = req.body;
            let idUserSend = req.session.user.id;
            let idUserReceive = idUser;
            let newMessage = new messageModel({ idUserSend, idUserReceive, message });
            await newMessage.save();
            return res.send("Gửi thành công");
        } catch (err) {
            console.error(err);
            return res.status(500).send("Lỗi server khi gửi tin nhắn");
        }
    } else {
        return res.status(401).send("Bạn chưa đăng nhập");
    }
});
server.listen(3200, () => {
    console.log("🚀 Server đang chạy tại http://localhost:3000");
});

