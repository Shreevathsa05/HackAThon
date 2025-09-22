import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../store/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import extractErrorMsg from "../utils/extractErrorMsg.js";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../api/api.js";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/";
    const { userData } = useSelector((state) => state.auth);
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
            const res = await api.post("/users/login", data, {
                signal: controllerRef.current.signal,
            });
            if (res.data.data?.user?.email) dispatch(login(res.data.data, user));
            // dispatch(login(res.data.data.user));
            navigate(from, { replace: true });
        } catch (error) {
            setLoading(false);
            if (error.name === "CanceledError") {
                console.log("Request canceled:", error.message);
            } else {
                console.log(error);
                setErrMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
            controllerRef.current = null;
        }
    };

    useEffect(() => {
        console.log("userData: ", userData);
    }, [userData]);

    useEffect(() => {
        return () => {
            if (controllerRef.current) controllerRef.current.abort();
        };
    }, []);

    return (
        <div>
            <h2>Login</h2>

            {errMsg && <p style={{ color: "red" }}>{errMsg}</p>}

            <form onSubmit={handleSubmit(submit)} noValidate>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="text"
                        placeholder="Enter your email"
                        {...register("email", { required: "email is required" })}
                    />
                    {errors.email && <p>{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        {...register("password", { required: "Password is required" })}
                    />
                    {errors.password && <p>{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p>
                Don’t have an account? <Link to="/signup">Sign up</Link>
            </p>
        </div>
    );
}

export default Login;
