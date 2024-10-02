'use client'

import { Button } from "@/app/components/Button"
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation"

export default function Welcome() {
    const route = useRouter()

    const { user, error, isLoading } = useUser();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;
  
    if (user) {
      return (
        <div>
          Welcome {user.name}! <a href="/api/auth/logout">Logout</a>
        </div>
      );
    }

    return (
        <div className="flex h-screen">
            <div className="m-auto text-center ">
                <h1>Welcome!</h1>
                <Button type='button' onClick={() => {

                    route.push("/api/auth/login")
                    // debugger
                }
                    }  className="mt-8">
                    {`Login`}
                    </Button>
                    {/* <a href="/api/auth/login">Login</a> */}
            </div>
        </div>
    )
}