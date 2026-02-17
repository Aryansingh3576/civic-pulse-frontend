// app/report/page.tsx — Report issue page
import { Suspense } from "react";
import { Container } from "@/components/ui/grid";
import ComplaintForm from "@/components/complaint-form";

export const metadata = {
    title: "Report an Issue — CivicPulse",
    description: "Submit a civic issue report with photo, voice, or text.",
};

export default function ReportPage() {
    return (
        <section className="py-24 sm:py-28" aria-labelledby="report-heading">
            <Container size="md">
                <div className="text-center mb-8 sm:mb-12">
                    <h1
                        id="report-heading"
                        className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)] mb-3"
                    >
                        Report an <span className="gradient-text">Issue</span>
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Describe the problem, add a photo, and we&apos;ll route it to the right
                        department automatically.
                    </p>
                </div>
                <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading form...</div>}>
                    <ComplaintForm />
                </Suspense>
            </Container>
        </section>
    );
}
