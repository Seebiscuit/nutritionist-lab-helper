import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.push("/labs");
    }, []);

    return (
        <Layout>
            <div>Redirecting to Labs page...</div>
        </Layout>
    );
}
