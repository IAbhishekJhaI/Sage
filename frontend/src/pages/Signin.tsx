import { Quote } from "../components/Quote"
import { Auth } from "../components/Auth"

export const Signin = () =>{
    return <div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="">
                <Auth type="signin"/>
            </div>
            <div>
                <Quote/>
            </div>
        </div>
    </div>
}