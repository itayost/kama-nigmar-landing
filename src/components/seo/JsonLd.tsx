interface JsonLdProps {
  readonly data: object;
}

// Escaping "<" prevents any string in the data from closing the script tag,
// which is the sanitization JSON-LD needs.
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
