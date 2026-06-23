/** Generate a large, realistic ReTeX resume for benchmarking and perf tests. */
export function generateResume(jobs: number): string {
  const parts: string[] = [
    "\\name{Jordan Sample}",
    "\\title{Principal Software Engineer}",
    "\\email{jordan@example.com}",
    "\\phone{+1 555 0100}",
    "\\location{San Francisco, CA}",
    "\\icon{github} \\href{https://github.com/jordan}{jordan}",
    "",
    "\\section{Experience}",
    "",
  ];
  for (let i = 0; i < jobs; i++) {
    parts.push(
      `\\job{title=Engineer ${i}, company=Company ${i}, location=Remote, start=${2000 + (i % 25)}, end=${2001 + (i % 25)}}{`,
      `Shipped \\textbf{feature ${i}} improving throughput by ${10 + (i % 80)}\\% across the platform.`,
      "\\begin{itemize}",
      `  \\item Built \\textcolor{#2563eb}{service ${i}} handling millions of requests`,
      `  \\item Mentored engineers and led \\textit{architecture} reviews`,
      "  \\item Reduced costs and improved reliability",
      "\\end{itemize}",
      "}",
      "",
    );
  }
  parts.push(
    "\\section{Skills}",
    "\\skills{TypeScript, JavaScript, React, Node.js, Go, Rust, AWS, GCP, Kubernetes, PostgreSQL}",
    "",
    "\\section{Education}",
    "\\education{school=State University, degree=BS Computer Science, start=1996, end=2000}",
  );
  return parts.join("\n");
}
