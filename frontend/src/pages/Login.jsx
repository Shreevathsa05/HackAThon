import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../store/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import extractErrorMsg from "../utils/extractErrorMsg.js";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../api/api.js";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

function Login() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

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
      const res = await api.post("/users/login", data);
      dispatch(login(res.data.data));
    } catch (error) {
      console.error(error);
      setErrMsg(extractErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>

        {errMsg && (
          <p className="text-red-600 text-sm text-center mb-4">{errMsg}</p>
        )}

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <Input
              label='email'
              type='email'
              placeholder='Enter your email'
              {...register('email', {
                required: true,
                validate: {
                  matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    "Email address must be a valid address",
                }
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Input
              label='password'
              type='password'
              placeholder='Enter your password'
              {...register('password', { required: true })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type='submit'
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
