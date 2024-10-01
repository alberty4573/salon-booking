'use client'

import { Button } from "@/app/components/Button"
import { useRouter } from "next/navigation"

export default function Welcome() {
    const route = useRouter()

    return (
        <div className="flex h-screen">
            <div className="m-auto text-center ">
                <h1>Welcome!</h1>
                <Button type='button' title="login" onClick={() => route.push("./mobile")}  className="mt-8"/>
            </div>
        </div>
    )
}