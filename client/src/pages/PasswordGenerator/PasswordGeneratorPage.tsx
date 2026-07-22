import PageHeader from "@/components/common/PageHeader";
import Card, { CardContent } from "@/components/ui/Card";
import PasswordGeneratorForm from "@/components/password/PasswordGeneratorForm";

export default function PasswordGeneratorPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Password Generator" description="Generate cryptographically secure passwords" />

      <div className="mx-auto max-w-xl">
        <Card>
          <CardContent>
            <PasswordGeneratorForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
