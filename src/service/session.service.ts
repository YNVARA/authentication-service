import SessionRepository from "@repository/session.repository";
import ResponseError from "@utils/response-error";

export default class SessionService {

    static async getAllSession(userId: string) {
        const response = await SessionRepository.getAllSessionByUserId(userId);
        return response;
    }

    static async deleteSession(id: string) {
        const session = await SessionRepository.getSessionById(id);
        if (!session) throw new ResponseError({ 
            status: 404, 
            code: "SESSION_NOT_FOUND", 
            message: "Session not found" 
        });

        await SessionRepository.deleteSessionById(id);
    }

}