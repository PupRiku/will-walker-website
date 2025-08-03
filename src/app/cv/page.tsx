// src/app/cv/page.tsx

import styles from './page.module.css';

export default function CVPage() {
  return (
    <main className={styles.cvContainer}>
      <header className={styles.header}>
        <h1 className={styles.nameHeading}>William L. Walker</h1>
        <p className={styles.contactInfo}>
          Theatre Director | Playwright | Educator <br />
          Paris, Texas · ✉️ Wm.montgomerie71@hotmail.com
        </p>
      </header>

      <section className={styles.cvSection}>
        <h2 className={styles.sectionTitle}>Artist Statement</h2>
        <p className={styles.introParagraph}>
          A dedicated theatre professional with over two decades of experience
          directing, teaching, and nurturing emerging talent, William L. Walker
          brings a bold, collaborative spirit to the stage. From Shakespeare to
          musical theatre to devised digital works, his directing blends
          classical understanding with contemporary innovation. As a playwright,
          educator, and advocate for arts access in rural communities, he
          continues to champion inclusive storytelling and educational
          opportunity.
        </p>
      </section>

      <section className={styles.cvSection}>
        <h2 className={styles.sectionTitle}>Education</h2>
        <ul className={styles.entryList}>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>
                Doctor of Education (Ed.D.) in Higher Education Leadership - ABD
              </p>
              <p className={styles.entryDetails}>Grand Canyon University</p>
            </div>
            <p className={styles.entryDate}>2013-Present</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>
                Master of Arts in Theatre Management & Directing
              </p>
              <p className={styles.entryDetails}>
                Texas Woman&apos;s University
              </p>
            </div>
            <p className={styles.entryDate}>2006-2009</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>
                Bachelor of Fine Arts in Theatre (Directing/Acting)
              </p>
              <p className={styles.entryDetails}>
                Sam Houston State University
              </p>
            </div>
            <p className={styles.entryDate}>1993-1997</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Associate of Arts in Drama</p>
              <p className={styles.entryDetails}>Blinn College</p>
            </div>
            <p className={styles.entryDate}>1990-1993</p>
          </li>
        </ul>
      </section>

      <section className={styles.cvSection}>
        <h2 className={styles.sectionTitle}>Playwriting</h2>
        <p className={styles.introParagraph}>
          William L. Walker is an emerging playwright whose works blend wit,
          heart, and an unabashed love of theatrical tradition. His plays often
          reimagine classics, play with genre, and explore the boundaries of
          stage and story.
        </p>
        <h3 className={styles.subSectionTitle}>Published & Produced Works</h3>
        <ul className={styles.entryList}>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Hamlet: A Horatio Story</p>
              <p className={styles.playDescription}>
                Published reinterpretation of Shakespeare&apos;s Hamlet told
                through the eyes of Horatio, exploring themes of grief, loyalty,
                and legacy.
              </p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>The Squatch of Avon</p>
              <p className={styles.playDescription}>
                A conspiracy comedy of Squatchy proportions, fully produced at
                the <b>Pyro PlayFest New Works Festival</b>.
                <br />
                🏆 Audience Choice Award Winner
              </p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Much Ado About Nothingness</p>
              <p className={styles.playDescription}>
                A funny and cerebral chance meeting between William Shakespeare
                and Samuel Beckett, produced at the{' '}
                <b>Pyro PlayFest New Works Festival</b>.
                <br />
                🏆 Audience Choice Award Winner
              </p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Heroes in the Pages</p>
              <p className={styles.playDescription}>
                A heartfelt journey through the books and stories that shape us,
                brought to life at the <b>Pyro PlayFest New Works Festival</b>.
              </p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Exit, Pursued by a Bear</p>
              <p className={styles.playDescription}>
                A chaotic comedic commentary on the weight of a single stage
                direction, fully staged at the{' '}
                <b>Pyro PlayFest New Works Festival</b>.
                <br />
                🏆 Audience Choice Award Winner
              </p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
        </ul>
      </section>

      <section className={styles.cvSection}>
        <h2 className={styles.sectionTitle}>Directing Portfolio</h2>
        <p className={styles.introParagraph}>
          William Walker&apos;s directing work spans classical theatre,
          contemporary comedies, musicals, devised pieces, and virtual
          productions. His style is rooted in ensemble collaboration and a focus
          on actor-driven storytelling. At Paris Junior College, he directs two
          productions each year, while also creating opportunities for digital
          performance and community engagement.
        </p>
        <h3 className={styles.subSectionTitle}>Shakespeare & Classics</h3>
        <ul className={styles.entryList}>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>The Tempest</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2020</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Macbeth</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2014</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>The Taming of the Shrew</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2013</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>The Crucible</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2012</p>
          </li>
        </ul>
        <h3 className={styles.subSectionTitle}>
          Musicals & Large-Scale Productions
        </h3>
        <ul className={styles.entryList}>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Spamalot!</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2020</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Les Misérables</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2013</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Children of Eden</p>
              <p className={styles.entryDetails}>Paris Community Theatre</p>
            </div>
            <p className={styles.entryDate}>2016</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Avenue Q</p>
              <p className={styles.entryDetails}>Paris Community Theatre</p>
            </div>
            <p className={styles.entryDate}>2012</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>9 to 5: The Musical</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2015</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Scrooge: The Musical</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2016</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>
                25th Annual Putnam County Spelling Bee
              </p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2011</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>The All Night Strut</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2014</p>
          </li>
        </ul>
        <h3 className={styles.subSectionTitle}>
          Comedies & Contemporary Works
        </h3>
        <ul className={styles.entryList}>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Almost, Maine</p>
              <p className={styles.entryDetails}>Paris Community Theatre</p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Noises Off!</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2018</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Peter and the Starcatcher</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2018</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Black Comedy</p>
              <p className={styles.entryDetails}>Paris Community Theatre</p>
            </div>
            <p className={styles.entryDate}>2014</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Private Lives</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2009</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Tom, Dick & Harry</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2012</p>
          </li>
        </ul>
        <h3 className={styles.subSectionTitle}>Original & Devised Work</h3>
        <ul className={styles.entryList}>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>The Squatch of Avon</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Heroes in the Pages</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Much Ado About Nothingness</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Exit, Pursued by a Bear</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Hamlet: A Horatio Story</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2025</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Star Wars of the Roses</p>
              <p className={styles.entryDetails}>Paris Junior College</p>
            </div>
            <p className={styles.entryDate}>2016</p>
          </li>
        </ul>
      </section>

      <section className={styles.cvSection}>
        <h2 className={styles.sectionTitle}>
          Academic & Professional Experience
        </h2>
        <ul className={styles.entryList}>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>
                Director of Drama & Musical Theatre
              </p>
              <p className={styles.entryDetails}>
                Paris Junior College - Paris, TX
              </p>
              <ul className={styles.responsibilitiesList}>
                <li>
                  Oversees all aspects of the Drama Department, including
                  budgeting, curriculum design, and production seasons
                </li>
                <li>Leads student recruitment and advises drama majors</li>
                <li>Directs two major theatrical productions annually</li>
                <li>Coordinator of the PJC New Works Festival</li>
                <li>
                  Faculty sponsor of Delta Psi Omega, national theatre honor
                  society
                </li>
                <li>
                  Manages external collaborations and community theatre outreach
                </li>
                <li>
                  Coordinates auditions and transfer guidance for students
                  pursuing professional and academic theatre opportunities
                </li>
              </ul>
            </div>
            <p className={styles.entryDate}>2009-Present</p>
          </li>
        </ul>
      </section>

      <section className={styles.cvSection}>
        <h2 className={styles.sectionTitle}>Voice Work</h2>
        <ul className={styles.entryList}>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Borrowed Lives Podcast</p>
              <p className={styles.playDescription}>
                Voice actor contributing to narrative podcast storytelling,
                blending performance technique with character-driven audio
                production.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className={styles.cvSection}>
        <h2 className={styles.sectionTitle}>Community Engagement</h2>
        <h3 className={styles.subSectionTitle}>Paris Community Theatre</h3>
        <ul className={styles.entryList}>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Board Vice President</p>
            </div>
            <p className={styles.entryDate}>Current</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Board President</p>
            </div>
            <p className={styles.entryDate}>2015-2016</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Board Vice President</p>
            </div>
            <p className={styles.entryDate}>2014-2015</p>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>Haunted Theatre Coordinator</p>
            </div>
            <p className={styles.entryDate}>2014-2015</p>
          </li>
        </ul>
      </section>

      <section className={styles.cvSection}>
        <h2 className={styles.sectionTitle}>Affiliations</h2>
        <ul className={styles.entryList}>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>
                <b>Delta Psi Omega</b>, National Theatre Honor Society (Sponsor)
              </p>
            </div>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>
                <b>Texas Educational Theatre Association</b>
              </p>
            </div>
          </li>
          <li className={styles.entryItem}>
            <div>
              <p className={styles.entryTitle}>
                <b>Association for Theatre in Higher Education</b>
              </p>
            </div>
          </li>
        </ul>
      </section>
    </main>
  );
}
