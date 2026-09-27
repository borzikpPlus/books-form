import express from "express"
import path from "node:path"
import "dotenv/config"
import { BookType } from "./types/BookType.js"
import { books } from "./data/books.js"
import { BookResponseType } from "./types/BookResponseType.js"

const cl = console.log
const PORT = process.env.PORT || 3200
const HOST = process.env.HOST || "http://localhost"

const app = express()
app.use(express.json())

app.get('/',(req,res)=>{
    res.writeHead(200,{
        "Content-Type":"text/html"
    })
    res.end("<h2>Hello from express</h2>")
})

app.get('/form',(req,res)=>{
    res.sendFile(path.resolve("src","pages","form.html"))
})

app.post('/books',(req,res)=>{
    const {title, price, is_active} = req.body ?? {}
    if(typeof title!=="string" || title.trim()==="" || typeof price!=="number" || price<0)
    {
        const response:BookResponseType = {
            data:null,
            error:"Wrong book data",
            status:400
        }
        res.status(response.status).json(response)
        return
    }
    const new_book:BookType = {
        id:books.length>0?books[books.length-1].id+1:1,
        title:title.trim(),
        price:price,
        is_active:is_active===true
    }
    books.push(new_book)
    const response:BookResponseType = {
        data:new_book,
        error:null,
        status:201
    }
    res.status(response.status).json(response)
})

//Отримати книжку за id
app.get('/books/:id', (req,res)=>{
    const id:number = +req.params.id
    const book:BookType|undefined = books.find((book)=>book.id===id);
    const exist_book:boolean = (book!==undefined)
    const response:BookResponseType = {
        data:exist_book?book as BookType:null,
        error:exist_book?null:"The book not found",
        status:exist_book?200:404
    };
    res.status(response.status).json(response)
})

app.get('/books/:title/:is_active',(req,res)=>{
    if(req.params.is_active!=="true" && req.params.is_active!=="false")
    {
        const response:BookResponseType = {
            data:null,
            error:"is_active must be true or false",
            status:400
        }
        res.status(response.status).json(response)
        return
    }
    const title:string = req.params.title.toLowerCase()
    const is_active:boolean = req.params.is_active==="true"
    const found_books:BookType[] = books.filter((book)=>book.is_active===is_active && book.title.toLowerCase().includes(title))
    const exist_books:boolean = found_books.length>0
    const response:BookResponseType = {
        data:exist_books?found_books:null,
        error:exist_books?null:"Books not found",
        status:exist_books?200:404
    }
    res.status(response.status).json(response)
})

//Отримати всі книжки
app.get('/books',(req,res)=>{
    const exist_book:boolean = books.length>0
    const response:BookResponseType = {
        data:exist_book?books:null,
        error:exist_book?null:"Books list is empty",
        status:exist_book?200:404
    };
    res.writeHead(response.status,{
        "Content-Type":"application/json"
    })
    res.end(JSON.stringify(response))
})



app.listen(PORT, ()=>{
    cl(`Server has been started ${HOST}:${PORT}`)
})