'use client'

import { Button } from "@/app/components/Button"
import { useRouter } from "next/navigation"

export default function Welcome() {
    const route = useRouter()

    return (
        <div className="flex h-screen">
            <div className="m-auto text-center ">
                <h1>Welcome!</h1>
                <Button type='button' onClick={() => route.push("/api/auth/login")}  className="mt-8">
                    {`Login`}
                    </Button>
            </div>
        </div>
    )
}