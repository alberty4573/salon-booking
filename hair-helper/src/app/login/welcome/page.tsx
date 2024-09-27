import Link from "next/link"

export default function Welcome() {
    return (
        <div className="flex h-screen">
            <div className="m-auto text-center	">
                <h1>Welcome!</h1>
                <button className="mt-8">
                    <Link href="./mobile">
                        <h1>Login</h1>
                    </Link>
                </button>
            </div>
        </div>
    )
}