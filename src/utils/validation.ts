// dependencies
import { ZodType } from "zod";
import ResponseError from "./response-error";

// types for success response
type SuccessResponse<T> = {
    status: number;
    message: string;
    data: T;
};

const Validation = <T>(schema: ZodType<T>, data: unknown): SuccessResponse<T> => {
    const result = schema.safeParse(data);

    if (!result.success) {
        // Format error issues
        const details = result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
        }));

        // Throw error
        throw new ResponseError({
            status: 400,
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details
        });
    }

    // Validation successful
    return {
        status: 200,
        message: "Validation success",
        data: result.data
    };
};

export default Validation;