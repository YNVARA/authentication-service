import request from "supertest";
import db from "../database/index";
import { users, providers, sessions } from "../database/schema";
import {
    url,
    user_register_data_password_mismatch,
    user_register_data,
    user_login_invalid_data,
} from "./test.config";

describe("Local Authentication", () => {

    beforeAll(async () => {
        await db.delete(sessions).execute();
        await db.delete(providers).execute();
        await db.delete(users).execute();
    })

    afterAll(async () => {
        await db.delete(sessions).execute();
        await db.delete(providers).execute();
        await db.delete(users).execute();
    })

    describe("Register", () => {
        it("should return a 400 status code if fields are empty", async () => {
            const response = await request(url).post('/auth/local/register').send({
                email: "",
                password: "",
                confirmPassword: ""
            });
            expect(response.status).toBe(400);
        })

        it("should return a 400 status code if passwords do not match", async () => {
            const response = await request(url).post('/auth/local/register').send(user_register_data_password_mismatch);
            expect(response.status).toBe(400);
            expect(response.body.code).toBe("VALIDATION_ERROR");
            expect(response.body.details[0].message).toBe("Passwords do not match");
        })

        it("should return a 201 status code if registration is successful", async () => {
            const response = await request(url).post('/auth/local/register').send(user_register_data);
            expect(response.status).toBe(201);
            expect(response.body.code).toBe("REGISTER_SUCCESS");
        })

        it("should return a 400 status code if email already is taken", async () => {
            const response = await request(url).post('/auth/local/register').send(user_register_data);
            expect(response.status).toBe(400);
            expect(response.body.code).toBe("EMAIL_TAKEN");
            expect(response.body.message).toBe("Email already taken");
        })
    })


    describe("Login", () => {
        it("should return a 400 status code if fields are empty", async () => {
            const response = await request(url).post('/auth/local/login').send({
                email: "",
                password: "",
            });
            expect(response.status).toBe(400);
        })

        it("should return a 401 status code if data user is invalid", async () => {
            const response = await request(url).post('/auth/local/login').send(user_login_invalid_data);
            expect(response.status).toBe(401);
            expect(response.body.code).toBe("INVALID_CREDENTIALS");
            expect(response.body.message).toBe("Invalid credentials");
        })
    })
});