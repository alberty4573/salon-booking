"use client"

import { Button } from "@/app/components/Button"
import { FormEvent } from "react"


export default function Mobile() {
    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        console.log(formData.get("mobile"))
    }


    return (
        <div className="flex h-screen">
            <div className="m-10">
                <form onSubmit={onSubmit}>
                    <h1>Please input your mobile number for login</h1>
                    <div className="pt-5 pb-5">
                        <label style={{fontFamily: 'sans-serif'}} >
                            Mobile Number:
                            <input type="text" name="mobile" />
                        </label>
                    </div>
                    <Button type="submit" title={"submit"}>Submit</Button>
                </form>

            </div>
        </div>
    )
}