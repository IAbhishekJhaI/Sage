import { Link, useNavigate } from "react-router-dom";
import { ChangeEvent, useState } from "react";
import type { SignupInput } from "@mysticalbun/sage-common";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const Auth = ({type} : {type: "signup" | "signin"}) =>{
    const navigate = useNavigate();
    const [postInputs, setPostInputs ]= useState<SignupInput>({
        name: "",
        email: "",
        password: ""
    });
    
    async function sendRequest() {
        try{
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/${type === "signup"? "signup":"signin"}`, postInputs);
            const jwt = response.data;
            localStorage.setItem("token", jwt);
            navigate("/blogs");
        } catch (e) {
            alert("Error while signing up. Please try again.");
        }
    }

    return <div className="h-screen flex justify-center flex-col">
        <div className="flex justify-center">
            <div>
                <div className="px-10">
                    <div className="text-3xl font-bold">
                        Create an account
                    </div>
                    <div className="text-zinc-600">
                        {type === "signin" ? "Dont have an account?" : "Already have an account?"}
                        <Link className="pl-2 underline" to={type === "signin" ? "/signup" : "/signin"}>
                            {type === "signin" ? "Sign up" : "Sign in" }
                        </Link>
                    </div>
                </div>
                <div className="pt-8">
                    {type === "signup" ? <LabelledInput label="Name" placeholder="Sage..." onChange={(e) =>{
                        setPostInputs({
                            ...postInputs,
                            name: e.target.value
                        })
                    }} /> : null}
                    <LabelledInput label="Email" placeholder="sageiscool@gmail.com"  onChange={(e) =>{
                        setPostInputs({
                            ...postInputs,
                            email: e.target.value
                        })
                    }} />
                    <LabelledInput label="Password" type={"password"} placeholder="shhhhh...." onChange={(e) =>{
                        setPostInputs({
                            ...postInputs,
                            password: e.target.value
                        })
                    }} />
                    <button onClick={sendRequest} type="button" className="mt-8 w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white focus:ring-4 focus:outline-none focus:ring-pink-200">
                    <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent">
                        {type === "signup" ? "Sign up" : "Sign in"}
                    </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
}

interface LabelledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

function LabelledInput({label, placeholder, onChange, type}: LabelledInputType){
    return <div>
        <label className="block mb-2 text-sm font-semibold pt-4 text-black">{label}</label>
        <input onChange={onChange} type={type || "text"} id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder={placeholder} required />
    </div>
}

