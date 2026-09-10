import path from "node:path";
import { fileURLToPath } from "node:url";

import { Document, Font, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import ReactMarkdown, { type Components } from "react-markdown";

import type { Resume } from "@/content/resume";
import type { ResumeBlock } from "@/lib/resume";

/**
 * The resume as a react-pdf document: US Letter, half-inch margins, Raleway
 * like the site. Rendered to public/MichaelCohenResume.pdf by
 * scripts/build-resume.tsx; nothing here is imported by the site itself.
 */

const fontDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fonts");

Font.register({
  family: "Raleway",
  fonts: [
    { src: path.join(fontDir, "Raleway-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontDir, "Raleway-Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
    { src: path.join(fontDir, "Raleway-SemiBold.ttf"), fontWeight: 600 },
    { src: path.join(fontDir, "Raleway-Bold.ttf"), fontWeight: 700 },
  ],
});
// A browser does not hyphenate by default; neither should the PDF.
Font.registerHyphenationCallback((word) => [word]);

const BASE = 10.5;

const styles = StyleSheet.create({
  page: {
    paddingVertical: 32,
    paddingHorizontal: 36,
    fontFamily: "Raleway",
    fontSize: BASE,
    lineHeight: 1.26,
    color: "#111",
  },
  header: { alignItems: "center", marginBottom: 4 },
  name: { fontSize: 17, fontWeight: 700, letterSpacing: 0.17, marginBottom: 2 },
  contact: { flexDirection: "row", gap: 2 * BASE },
  heading: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginTop: 6,
    marginBottom: 3,
    paddingBottom: 1,
    borderBottomWidth: 0.8,
    borderBottomColor: "#111",
  },
  block: { marginTop: 5 },
  line: { flexDirection: "row", justifyContent: "space-between", gap: BASE },
  secondLine: { marginTop: 2 },
  company: { fontWeight: 700 },
  role: { fontWeight: 600 },
  bullets: { marginTop: 2 },
  bullet: { flexDirection: "row" },
  bulletGap: { marginTop: 0.5 },
  dot: { width: 1.1 * BASE, paddingLeft: 2 },
  bulletText: { flex: 1 },
  link: { color: "#111", textDecoration: "none" },
  em: { fontStyle: "italic" },
  strong: { fontWeight: 700 },
});

// The same Markdown subset as the site's bullets (components/typography/
// markdown.tsx), rendered to PDF text: inline links, emphasis, nothing else.
const allowedElements = ["p", "a", "strong", "em", "code"];
const urlTransform = (url: string) => (/^(https?:|mailto:)/i.test(url) ? url : "");
const components: Components = {
  p: ({ children }) => <Text>{children}</Text>,
  a: ({ href, children }) =>
    href ? (
      <Link src={href} style={styles.link}>
        {children}
      </Link>
    ) : (
      <>{children}</>
    ),
  em: ({ children }) => <Text style={styles.em}>{children}</Text>,
  strong: ({ children }) => <Text style={styles.strong}>{children}</Text>,
  code: ({ children }) => <Text>{children}</Text>,
};

function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      allowedElements={allowedElements}
      unwrapDisallowed
      urlTransform={urlTransform}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <View style={styles.bullets}>
      {items.map((item, index) => (
        <View key={index} style={[styles.bullet, index > 0 ? styles.bulletGap : {}]}>
          <Text style={styles.dot}>•</Text>
          <View style={styles.bulletText}>
            <Markdown>{item}</Markdown>
          </View>
        </View>
      ))}
    </View>
  );
}

function Block({ block }: { block: ResumeBlock }) {
  return (
    <View style={styles.block}>
      <View style={styles.line}>
        <Link src={block.url} style={[styles.link, styles.company]}>
          {block.company}
        </Link>
        <Text>
          {block.startLabel} – {block.endLabel}
        </Text>
      </View>
      <View style={[styles.line, styles.secondLine]}>
        <Text style={styles.role}>
          {block.role}
          {block.team ? `  |  ${block.team}` : ""}
        </Text>
      </View>
      <Bullets items={block.bullets} />
    </View>
  );
}

export function ResumeDocument({ resume, blocks }: { resume: Resume; blocks: ResumeBlock[] }) {
  const siteLabel = resume.site.replace(/^https?:\/\//, "");
  return (
    <Document
      title={`${resume.name} — Resume`}
      author={resume.name}
      subject="Resume"
      language="en-US"
      creator={siteLabel}
      producer="react-pdf"
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.name}</Text>
          <View style={styles.contact}>
            <Text>{resume.location}</Text>
            <Link src={`mailto:${resume.email}`} style={styles.link}>
              {resume.email}
            </Link>
            <Link src={resume.site} style={styles.link}>
              {siteLabel}
            </Link>
          </View>
        </View>

        <Text style={styles.heading}>Work Experience</Text>
        {blocks.map((block) => (
          <Block key={`${block.company}-${block.startIso}-${block.team ?? ""}`} block={block} />
        ))}

        <Text style={styles.heading}>Education</Text>
        {resume.education.map((item) => (
          <View key={item.school} style={styles.block}>
            <View style={styles.line}>
              <Text style={styles.company}>{item.school}</Text>
              <Text>{item.when}</Text>
            </View>
            <View style={[styles.line, styles.secondLine]}>
              <Text style={styles.role}>{item.degree}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.heading}>Skills</Text>
        <Bullets
          items={resume.skills.map(
            (group) => `**${group.label}:** ${group.items.join(", ")}`,
          )}
        />
      </Page>
    </Document>
  );
}
