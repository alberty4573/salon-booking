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
        <div>
            <form onSubmit={onSubmit}>
                <h1>Please input your mobile number for login</h1>
                <label>
                    Mobile Number:
                    <input type="text" name="mobile" />
                </label>
                <Button type="submit" label="Submit" />
            </form>
        </div>
    )
}