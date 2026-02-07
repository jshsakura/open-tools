import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Terms' });
    return {
        title: `${t('title')} | Open Tools`,
    };
}

export default function TermsPage() {
    const t = useTranslations('Terms');
    const sections = ['acceptance', 'service_desc', 'user_conduct', 'intellectual_property', 'disclaimer', 'liability', 'modifications', 'governing_law'];

    return (
        <div className="container mx-auto px-4 pt-12 pb-24 max-w-3xl">
            <div className="space-y-6">
                <div className="space-y-3 text-center">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-sm text-muted-foreground italic">
                        {t('lastUpdated')}
                    </p>
                </div>

                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none space-y-6 mt-10">
                    {sections.map((section) => (
                        <section key={section} className="space-y-3 p-6 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm shadow-sm group hover:border-primary/20 transition-colors">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {t(`sections.${section}.title`)}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
                                {t(`sections.${section}.content`)}
                            </p>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
