"use client"

import { useState, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type SchemaType = "Article" | "Product" | "FAQ" | "Organization" | "LocalBusiness" | "Person" | "Event" | "BreadcrumbList"

interface FieldDef {
    key: string
    label: string
    type: "text" | "textarea" | "url" | "number" | "date"
    placeholder?: string
}

const SCHEMA_FIELDS: Record<SchemaType, FieldDef[]> = {
    Article: [
        { key: "headline", label: "Headline", type: "text", placeholder: "Article title" },
        { key: "author", label: "Author", type: "text", placeholder: "Author name" },
        { key: "datePublished", label: "Date Published", type: "date" },
        { key: "dateModified", label: "Date Modified", type: "date" },
        { key: "image", label: "Image URL", type: "url", placeholder: "https://..." },
        { key: "description", label: "Description", type: "textarea", placeholder: "Article description" },
        { key: "publisher", label: "Publisher Name", type: "text", placeholder: "Publisher" },
    ],
    Product: [
        { key: "name", label: "Product Name", type: "text", placeholder: "Product name" },
        { key: "description", label: "Description", type: "textarea", placeholder: "Product description" },
        { key: "image", label: "Image URL", type: "url", placeholder: "https://..." },
        { key: "brand", label: "Brand", type: "text", placeholder: "Brand name" },
        { key: "sku", label: "SKU", type: "text", placeholder: "SKU-12345" },
        { key: "price", label: "Price", type: "number", placeholder: "29.99" },
        { key: "currency", label: "Currency", type: "text", placeholder: "USD" },
    ],
    FAQ: [
        { key: "q1", label: "Question 1", type: "text", placeholder: "First question" },
        { key: "a1", label: "Answer 1", type: "textarea", placeholder: "First answer" },
        { key: "q2", label: "Question 2", type: "text", placeholder: "Second question" },
        { key: "a2", label: "Answer 2", type: "textarea", placeholder: "Second answer" },
        { key: "q3", label: "Question 3", type: "text", placeholder: "Third question" },
        { key: "a3", label: "Answer 3", type: "textarea", placeholder: "Third answer" },
    ],
    Organization: [
        { key: "name", label: "Name", type: "text", placeholder: "Organization name" },
        { key: "url", label: "URL", type: "url", placeholder: "https://example.com" },
        { key: "logo", label: "Logo URL", type: "url", placeholder: "https://example.com/logo.png" },
        { key: "description", label: "Description", type: "textarea", placeholder: "About the organization" },
        { key: "email", label: "Email", type: "text", placeholder: "info@example.com" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1-234-567-8900" },
    ],
    LocalBusiness: [
        { key: "name", label: "Business Name", type: "text", placeholder: "Business name" },
        { key: "address", label: "Street Address", type: "text", placeholder: "123 Main St" },
        { key: "city", label: "City", type: "text", placeholder: "City" },
        { key: "state", label: "State/Region", type: "text", placeholder: "State" },
        { key: "zip", label: "Postal Code", type: "text", placeholder: "12345" },
        { key: "country", label: "Country", type: "text", placeholder: "US" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+1-234-567-8900" },
        { key: "url", label: "Website", type: "url", placeholder: "https://..." },
    ],
    Person: [
        { key: "name", label: "Name", type: "text", placeholder: "Full name" },
        { key: "jobTitle", label: "Job Title", type: "text", placeholder: "Software Engineer" },
        { key: "url", label: "URL", type: "url", placeholder: "https://..." },
        { key: "image", label: "Photo URL", type: "url", placeholder: "https://..." },
        { key: "email", label: "Email", type: "text", placeholder: "email@example.com" },
        { key: "sameAs", label: "Social URLs (comma-separated)", type: "text", placeholder: "https://twitter.com/..., https://linkedin.com/..." },
    ],
    Event: [
        { key: "name", label: "Event Name", type: "text", placeholder: "Event name" },
        { key: "startDate", label: "Start Date", type: "date" },
        { key: "endDate", label: "End Date", type: "date" },
        { key: "location", label: "Location Name", type: "text", placeholder: "Venue name" },
        { key: "address", label: "Address", type: "text", placeholder: "123 Main St" },
        { key: "description", label: "Description", type: "textarea", placeholder: "Event description" },
        { key: "image", label: "Image URL", type: "url", placeholder: "https://..." },
    ],
    BreadcrumbList: [
        { key: "item1Name", label: "Item 1 Name", type: "text", placeholder: "Home" },
        { key: "item1Url", label: "Item 1 URL", type: "url", placeholder: "https://example.com/" },
        { key: "item2Name", label: "Item 2 Name", type: "text", placeholder: "Category" },
        { key: "item2Url", label: "Item 2 URL", type: "url", placeholder: "https://example.com/category" },
        { key: "item3Name", label: "Item 3 Name", type: "text", placeholder: "Page" },
        { key: "item3Url", label: "Item 3 URL", type: "url", placeholder: "https://example.com/category/page" },
    ],
}

function buildJsonLd(type: SchemaType, values: Record<string, string>): object {
    const clean = (keys: string[]) => {
        const result: Record<string, string> = {}
        keys.forEach(k => { if (values[k]) result[k] = values[k] })
        return result
    }

    switch (type) {
        case "Article": {
            const v = clean(["headline", "author", "datePublished", "dateModified", "image", "description", "publisher"])
            const schema: Record<string, unknown> = {
                "@context": "https://schema.org",
                "@type": "Article",
            }
            if (v.headline) schema.headline = v.headline
            if (v.description) schema.description = v.description
            if (v.image) schema.image = v.image
            if (v.datePublished) schema.datePublished = v.datePublished
            if (v.dateModified) schema.dateModified = v.dateModified
            if (v.author) schema.author = { "@type": "Person", name: v.author }
            if (v.publisher) schema.publisher = { "@type": "Organization", name: v.publisher }
            return schema
        }
        case "Product": {
            const v = clean(["name", "description", "image", "brand", "sku", "price", "currency"])
            const schema: Record<string, unknown> = {
                "@context": "https://schema.org",
                "@type": "Product",
            }
            if (v.name) schema.name = v.name
            if (v.description) schema.description = v.description
            if (v.image) schema.image = v.image
            if (v.brand) schema.brand = { "@type": "Brand", name: v.brand }
            if (v.sku) schema.sku = v.sku
            if (v.price && v.currency) {
                schema.offers = {
                    "@type": "Offer",
                    price: v.price,
                    priceCurrency: v.currency,
                }
            }
            return schema
        }
        case "FAQ": {
            const pairs: { q: string; a: string }[] = []
            for (let i = 1; i <= 3; i++) {
                if (values[`q${i}`] && values[`a${i}`]) {
                    pairs.push({ q: values[`q${i}`], a: values[`a${i}`] })
                }
            }
            return {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: pairs.map(p => ({
                    "@type": "Question",
                    name: p.q,
                    acceptedAnswer: { "@type": "Answer", text: p.a },
                })),
            }
        }
        case "Organization": {
            const v = clean(["name", "url", "logo", "description", "email", "phone"])
            const schema: Record<string, unknown> = {
                "@context": "https://schema.org",
                "@type": "Organization",
            }
            if (v.name) schema.name = v.name
            if (v.url) schema.url = v.url
            if (v.logo) schema.logo = v.logo
            if (v.description) schema.description = v.description
            if (v.email) schema.email = v.email
            if (v.phone) schema.telephone = v.phone
            return schema
        }
        case "LocalBusiness": {
            const v = clean(["name", "address", "city", "state", "zip", "country", "phone", "url"])
            const schema: Record<string, unknown> = {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
            }
            if (v.name) schema.name = v.name
            if (v.url) schema.url = v.url
            if (v.phone) schema.telephone = v.phone
            if (v.address || v.city || v.state || v.zip || v.country) {
                schema.address = {
                    "@type": "PostalAddress",
                    ...(v.address && { streetAddress: v.address }),
                    ...(v.city && { addressLocality: v.city }),
                    ...(v.state && { addressRegion: v.state }),
                    ...(v.zip && { postalCode: v.zip }),
                    ...(v.country && { addressCountry: v.country }),
                }
            }
            return schema
        }
        case "Person": {
            const v = clean(["name", "jobTitle", "url", "image", "email", "sameAs"])
            const schema: Record<string, unknown> = {
                "@context": "https://schema.org",
                "@type": "Person",
            }
            if (v.name) schema.name = v.name
            if (v.jobTitle) schema.jobTitle = v.jobTitle
            if (v.url) schema.url = v.url
            if (v.image) schema.image = v.image
            if (v.email) schema.email = v.email
            if (v.sameAs) schema.sameAs = v.sameAs.split(",").map(s => s.trim()).filter(Boolean)
            return schema
        }
        case "Event": {
            const v = clean(["name", "startDate", "endDate", "location", "address", "description", "image"])
            const schema: Record<string, unknown> = {
                "@context": "https://schema.org",
                "@type": "Event",
            }
            if (v.name) schema.name = v.name
            if (v.startDate) schema.startDate = v.startDate
            if (v.endDate) schema.endDate = v.endDate
            if (v.description) schema.description = v.description
            if (v.image) schema.image = v.image
            if (v.location) {
                schema.location = {
                    "@type": "Place",
                    name: v.location,
                    ...(v.address && { address: v.address }),
                }
            }
            return schema
        }
        case "BreadcrumbList": {
            const items: { name: string; url: string }[] = []
            for (let i = 1; i <= 3; i++) {
                if (values[`item${i}Name`] && values[`item${i}Url`]) {
                    items.push({ name: values[`item${i}Name`], url: values[`item${i}Url`] })
                }
            }
            return {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: items.map((item, idx) => ({
                    "@type": "ListItem",
                    position: idx + 1,
                    name: item.name,
                    item: item.url,
                })),
            }
        }
    }
}

function validateJsonLd(json: string): string | null {
    try {
        const parsed = JSON.parse(json)
        if (!parsed["@context"] || !parsed["@type"]) {
            return "missing_context"
        }
        return null
    } catch {
        return "invalid_json"
    }
}

const SCHEMA_TYPES: SchemaType[] = ["Article", "Product", "FAQ", "Organization", "LocalBusiness", "Person", "Event", "BreadcrumbList"]

export function JsonLdGeneratorTool() {
    const t = useTranslations("JsonLdGenerator")
    const [schemaType, setSchemaType] = useState<SchemaType>("Article")
    const [values, setValues] = useState<Record<string, string>>({})
    const [copied, setCopied] = useState(false)

    const fields = SCHEMA_FIELDS[schemaType]

    const jsonLd = useMemo(() => {
        const schema = buildJsonLd(schemaType, values)
        return JSON.stringify(schema, null, 2)
    }, [schemaType, values])

    const scriptTag = useMemo(() => {
        return `<script type="application/ld+json">\n${jsonLd}\n</script>`
    }, [jsonLd])

    const validationError = useMemo(() => validateJsonLd(jsonLd), [jsonLd])

    const handleFieldChange = useCallback((key: string, value: string) => {
        setValues(prev => ({ ...prev, [key]: value }))
    }, [])

    const handleTypeChange = useCallback((type: SchemaType) => {
        setSchemaType(type)
        setValues({})
    }, [])

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }, [t])

    const handleClear = useCallback(() => {
        setValues({})
    }, [])

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Schema Type Selector */}
            <GlassCard className="p-4">
                <Label className="text-sm font-semibold mb-3 block">{t("schemaType")}</Label>
                <div className="flex flex-wrap gap-2">
                    {SCHEMA_TYPES.map((type) => (
                        <Button
                            key={type}
                            variant={schemaType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTypeChange(type)}
                        >
                            {t(`types.${type}`)}
                        </Button>
                    ))}
                </div>
            </GlassCard>

            {/* Two-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Form Panel */}
                <GlassCard className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">{t("formTitle")}</Label>
                        <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 gap-1">
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("clear")}
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {fields.map((field) => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                                {field.type === "textarea" ? (
                                    <Textarea
                                        value={values[field.key] || ""}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        placeholder={field.placeholder}
                                        className="font-mono text-sm min-h-[60px] resize-y"
                                    />
                                ) : (
                                    <Input
                                        type={field.type === "url" ? "url" : field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                                        value={values[field.key] || ""}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        placeholder={field.placeholder}
                                        className="font-mono text-sm"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Preview Panel */}
                <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">{t("preview")}</Label>
                        <div className="flex items-center gap-2">
                            {!validationError && (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {t("valid")}
                                </span>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1"
                                onClick={() => handleCopy(scriptTag)}
                            >
                                {copied
                                    ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    : <Copy className="h-3.5 w-3.5" />
                                }
                                {t("copyScript")}
                            </Button>
                        </div>
                    </div>
                    <Textarea
                        value={scriptTag}
                        readOnly
                        className="font-mono text-sm min-h-[400px] resize-y"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1"
                        onClick={() => handleCopy(jsonLd)}
                    >
                        {copied
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            : <Copy className="h-3.5 w-3.5" />
                        }
                        {t("copyJson")}
                    </Button>
                </GlassCard>
            </div>

            {/* Validation */}
            {validationError && (
                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        {t(`errors.${validationError}`)}
                    </div>
                </GlassCard>
            )}
        </div>
    )
}
