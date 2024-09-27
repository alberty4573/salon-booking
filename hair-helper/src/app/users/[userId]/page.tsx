export default function UserPage({ params }: {
    params: {
        userId: string;
    };
}) {
    return (
        <div>
        <h1>User {params.userId}</h1>
        {/* <User /> */}
        </div>
    );
}