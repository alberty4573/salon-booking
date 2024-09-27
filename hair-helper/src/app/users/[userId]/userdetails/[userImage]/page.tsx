export default function UserPage({ params }: {
    params: {
        userId: string;
        userImage: string;
    };
}) {
    return (
        <div>
        <h1>User {params.userId}</h1>
        <h2>Image {params.userImage}</h2>
        {/* <User /> */}
        </div>
    );
}