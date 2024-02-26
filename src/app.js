import express from "express";
import { __dirname } from "./utils/utils.js";
import ViewsRouter from "./routers/views/views.router.js";
import productsApiRouter from "./routers/api/products.router.js";
import cartsApiRouter from "./routers/api/carts.router.js";
import authApiRouter from "./routers/api/auth.router.js";
import handlebars from "express-handlebars";
import path from "path";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "./config/passaport.js";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware.js";
import { addLogger } from "./config/logger.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(addLogger);
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));

app.engine("handlebars", handlebars.engine());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

initializePassport();
app.use(passport.initialize());

app.use("/", ViewsRouter);
app.use("/api/products", productsApiRouter);
app.use("/api/carts", cartsApiRouter);
app.use("/api/auth", authApiRouter);
app.use(errorHandlerMiddleware);

export default app;
