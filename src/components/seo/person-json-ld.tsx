import { resume } from "@/content/resume";
import { companies } from "@/content/work";
import { CONTACT_EMAIL, PROFILES, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { companyViews } from "@/lib/work";

/**
 * Schema.org structured data for the home page: a ProfilePage whose main
 * entity is the Person, with the current employer and title taken from the
 * work history, the school from the résumé content and `sameAs` links to
 * the profiles in lib/site.ts. "Michael Cohen" is a crowded name; the
 * sameAs links are what let a search engine tell this one apart.
 *
 * Rendered on the server into the prerendered HTML. The JSON is embedded
 * with `<` escaped so nothing in the content can close the script element.
 */
export function PersonJsonLd() {
  const current = companyViews(companies).find((company) => company.endIso === null);
  const role = current?.entries[0];
  const school = resume.education[0];

  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: SITE_NAME,
    givenName: "Michael",
    familyName: "Cohen",
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/portrait.jpg`,
    description: SITE_DESCRIPTION,
    // The address on the domain, already on the page; the personal one is not published.
    email: CONTACT_EMAIL,
    ...(role && { jobTitle: role.role }),
    ...(current && {
      worksFor: {
        "@type": "Organization",
        name: current.name,
        ...(current.url && { url: current.url }),
      },
    }),
    ...(school && {
      alumniOf: { "@type": "CollegeOrUniversity", name: school.school },
    }),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      addressCountry: "US",
    },
    sameAs: PROFILES.map((profile) => profile.url),
  };

  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profile`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    mainEntity: person,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
