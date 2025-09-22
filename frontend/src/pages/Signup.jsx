import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { login, logout } from "../store/authSlice.js";
import extractErrorMsg from "../utils/extractErrorMsg.js";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";

function Signup() {
    const dispatch = useDispatch();
    const controllerRef = useRef(null);
    const [errMsg, setErrMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const submit = async (data) => {
        setLoading(true);
        setErrMsg("");
        try {
            controllerRef.current = new AbortController();
            const res = await api.post("/users/register", data, {
                signal: controllerRef.current.signal,
            });
            if (res.data.data?.email) dispatch(login(res.data.data));
        } catch (error) {
            setLoading(false);
            dispatch(logout());
            if (isCancel(error)) {
                console.log("Request canceled:", error.message);
            } else {
                setErrMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
            controllerRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (controllerRef.current) controllerRef.current.abort();
        };
    }, []);

    return (
        <div>
            <h2>Create an Account</h2>

            {errMsg && <p style={{ color: "red" }}>{errMsg}</p>}

            <form onSubmit={handleSubmit(submit)} noValidate>
                <div>
                    <label htmlFor="fullName">Full Name</label>
                    <input
                        id="fullName"
                        type="text"
                        placeholder="Enter full name"
                        {...register("fullName", { required: "Full name is required" })}
                    />
                    {errors.fullName && <p>{errors.fullName.message}</p>}
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        {...register("email", { required: "Email is required" })}
                    />
                    {errors.email && <p>{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        {...register("password", { required: "Password is required" })}
                    />
                    {errors.password && <p>{errors.password.message}</p>}
                </div>
                <div>
                    <label htmlFor="role">Role: </label>
                    <select
                        name="role"
                        id="role"
                        {...register("role", { required: "Role is required" })}
                    >
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="parent">parent</option>
                    </select>
                    {errors.role && <p>{errors.role.message}</p>}
                </div>


                <button type="submit" disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>

            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Signup;
