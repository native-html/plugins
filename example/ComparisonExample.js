import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import RenderHTML from '@native-html/render';
import table from '@native-html/table-plugin';
import heuristicTableRenderers, {
  colgroupModel
} from '@native-html/heuristic-table-plugin';
import WebView from 'react-native-webview';

const WRAPPER_OPEN = '<div style="font-family: Boston;">';
const WRAPPER_CLOSE = '</div>';
const SPACER = '<div style="padding-top: 50px" />';

const wrap = (content) =>
  `${WRAPPER_OPEN}\n  ${content}\n  ${SPACER}\n${WRAPPER_CLOSE}`;

// Fictional sample data shared across the budget layout variants.
const departmentBudgetSpaced = `
<div style="padding: 50px; border: 2px solid red">
<table style="border-collapse: collapse; width: 100.055%; height: 216px" border="1">
    <colgroup>
      <col style="width: 40%" />
      <col style="width: 20%" />
      <col style="width: 25%" />
      <col style="width: 15%" />
    </colgroup>
    <tbody>
      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">
          <strong>Department<br /><br /></strong>
        </td>
        <td style="border: 1px solid black; height: 24px"><strong>Planned (USD)</strong></td>
        <td style="border: 1px solid black; height: 24px"><strong>Actual (USD)</strong></td>
        <td style="border: 1px solid black; height: 24px"><strong>Change (%)</strong></td>
      </tr>
      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Customer Support<br /><br /></td>
        <td style="border: 1px solid black; height: 48px">
          $80,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >2</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">
          $84,000<a
            href="https://example.com/sample-budget"
            target="_blank"
            rel="noopener"
            ><span style="color: rgb(68, 79, 171)"><sup>2</sup></span></a
          >
        </td>
        <td style="border: 1px solid black; height: 48px">5.0</td>
      </tr>
      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Product Development<br /><br /></td>
        <td style="border: 1px solid black; height: 48px">
          $120,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >3</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">
          $132,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >3</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">10.0</td>
      </tr>
      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Marketing and Events<br /><br /></td>
        <td style="border: 1px solid black; height: 48px">
          $60,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >4</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">
          $63,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >4</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">5.0</td>
      </tr>
      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Business Operations&nbsp;<br /><br /></td>
        <td style="border: 1px solid black; height: 48px">
          $100,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >5</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">
          $108,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >5</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">8.0</td>
      </tr>
    </tbody>
  </table></div>`;

const departmentBudgetSpacedBare = `<table style="border-collapse: collapse; width: 100.055%; height: 216px" border="1">
    <colgroup>
      <col style="width: 40%" />
      <col style="width: 20%" />
      <col style="width: 25%" />
      <col style="width: 15%" />
    </colgroup>
    <tbody>
      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">
          <strong>Department<br /><br /></strong>
        </td>
        <td style="border: 1px solid black; height: 24px"><strong>Planned (USD)</strong></td>
        <td style="border: 1px solid black; height: 24px"><strong>Actual (USD)</strong></td>
        <td style="border: 1px solid black; height: 24px"><strong>Change (%)</strong></td>
      </tr>
      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Customer Support<br /><br /></td>
        <td style="border: 1px solid black; height: 48px">
          $80,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >2</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">
          $84,000<a
            href="https://example.com/sample-budget"
            target="_blank"
            rel="noopener"
            ><span style="color: rgb(68, 79, 171)"><sup>2</sup></span></a
          >
        </td>
        <td style="border: 1px solid black; height: 48px">5.0</td>
      </tr>
      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Product Development<br /><br /></td>
        <td style="border: 1px solid black; height: 48px">
          $120,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >3</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">
          $132,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >3</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">10.0</td>
      </tr>
      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Marketing and Events<br /><br /></td>
        <td style="border: 1px solid black; height: 48px">
          $60,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >4</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">
          $63,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >4</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">5.0</td>
      </tr>
      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Business Operations&nbsp;<br /><br /></td>
        <td style="border: 1px solid black; height: 48px">
          $100,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >5</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">
          $108,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >5</a
              ></span
            ></sup
          >
        </td>
        <td style="border: 1px solid black; height: 48px">8.0</td>
      </tr>
    </tbody>
  </table>`;

const planningComparison = `<table style="border-collapse: collapse; width: 99.9442%; height: 168px" border="1">
    <colgroup>
      <col style="width: 50%" />
      <col style="width: 50%" />
    </colgroup>

    <tbody>
      <tr style="height: 24px">
        <td style="height: 24px"><strong>Individual Planning</strong></td>

        <td style="height: 24px"><strong>Team Planning&nbsp;</strong></td>
      </tr>

      <tr style="height: 24px">
        <td style="height: 24px">One person sets priorities&nbsp;</td>

        <td style="height: 24px">Shared goals and responsibilities&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="height: 24px">Personal notes and checklists&nbsp;</td>

        <td style="height: 24px">Shared calendar and task board&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="height: 24px">Updates happen as needed&nbsp;</td>

        <td style="height: 24px">Regular progress check-ins&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="height: 24px">Suited to small projects&nbsp;</td>

        <td style="height: 24px">Suited to larger projects&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="height: 24px">Flexible personal schedule&nbsp;</td>

        <td style="height: 24px">Coordinated team schedule&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="height: 24px">Informal progress tracking&nbsp;</td>

        <td style="height: 24px">Shared summaries at each milestone&nbsp;</td>
      </tr>
    </tbody>
  </table>`;

const valuePropChecklist = `<table style="width: 100%; border-collapse: collapse">
    <tbody>
      <tr>
        <td style="font-size: 36px; color: #5762ce; width: 40px; text-align: center"><strong>✓</strong><br /><br /></td>

        <td><strong>Quick Setup &ndash;</strong> Start a new project with a name, a description, and a few simple steps.<br /><br /></td>
      </tr>

      <tr>
        <td style="font-size: 36px; color: #5762ce; width: 40px; text-align: center"><strong>✓</strong><br /><br /></td>

        <td><strong>Detailed monthly invoice &ndash;</strong> See completed tasks, upcoming milestones, and recent updates in one place.<br /><br /></td>
      </tr>

      <tr>
        <td style="font-size: 36px; color: #5762ce; width: 40px; text-align: center"><strong>✓</strong><br /><br /></td>

        <td>
          <strong>Easy Collaboration &ndash;</strong> Share notes, assign tasks, and keep everyone informed as the project moves forward.<br /><br />
        </td>
      </tr>
    </tbody>
  </table>`;

const departmentBudgetFractionalCols = `<table style="border-collapse: collapse; width: 100.055%" border="1">
    <colgroup>
      <col style="width: 14.6141%" />
      <col style="width: 35.4475%" />
      <col style="width: 25.0308%" />
      <col style="width: 25.0308%" />
    </colgroup>

    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Department</strong></td>

        <td style="border: 1px solid black"><strong>Planned (USD)</strong></td>

        <td style="border: 1px solid black"><strong>Actual (USD)</strong></td>

        <td style="border: 1px solid black"><strong>Change (%)</strong></td>
      </tr>

      <tr>
        <td style="border: 1px solid black">Customer Support</td>

        <td style="border: 1px solid black">
          $80,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >2</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">
          $84,000<a
            href="https://example.com/sample-budget"
            target="_blank"
            rel="noopener"
            ><span style="color: rgb(68, 79, 171)"><sup>2</sup></span></a
          >
        </td>

        <td style="border: 1px solid black">5.0</td>
      </tr>

      <tr>
        <td style="border: 1px solid black">Product Development</td>

        <td style="border: 1px solid black">
          $120,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >3</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">
          $132,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >3</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">10.0</td>
      </tr>

      <tr>
        <td style="border: 1px solid black">Marketing and Events</td>

        <td style="border: 1px solid black">
          $60,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >4</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">
          $63,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >4</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">5.0</td>
      </tr>

      <tr>
        <td style="border: 1px solid black">Business Operations&nbsp;</td>

        <td style="border: 1px solid black">
          $100,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >5</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">
          $108,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >5</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">8.0</td>
      </tr>
    </tbody>
  </table>`;

const projectMilestones = `<table style="border-collapse: collapse; width: 99.9442%; border: 1px solid black">
    <colgroup>
      <col style="width: 50%" />
      <col style="width: 50%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Project Milestone</strong></td>
        <td style="border: 1px solid black"><strong>Expected Outcome</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Kickoff</td>
        <td style="border: 1px solid black">Agree on goals, roles, and the overall timeline</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">First Draft</td>
        <td style="border: 1px solid black">Prepare an initial version for team feedback</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Review</td>
        <td style="border: 1px solid black">Collect comments and agree on revisions</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Launch</td>
        <td style="border: 1px solid black">Publish the final version and share a summary</td>
      </tr>
    </tbody>
  </table>`;

const servicePlanComparison = `<table style="border-collapse: collapse; width: 99.972%" border="1">
    <colgroup>
      <col style="width: 33.2398%" />
      <col style="width: 33.2398%" />
      <col style="width: 33.2398%" />
    </colgroup>

    <tbody>
      <tr>
        <td><strong>Feature</strong></td>

        <td><strong>Basic Plan</strong></td>

        <td><strong>Plus Plan</strong></td>
      </tr>

      <tr>
        <td>Support</td>

        <td>Email support during business hours&nbsp;&nbsp;</td>

        <td>Priority support with live chat and callbacks&nbsp;</td>
      </tr>

      <tr>
        <td>Availability&nbsp;</td>

        <td>Weekday appointments only&nbsp;</td>

        <td>Weekday and weekend appointments&nbsp;</td>
      </tr>

      <tr>
        <td>Flexibility&nbsp;</td>

        <td>Fixed monthly package&nbsp;</td>

        <td>Adjustable package with optional extras&nbsp;</td>
      </tr>

      <tr>
        <td>Customisation&nbsp;</td>

        <td>Standard options only</td>

        <td>Personalised options for each project&nbsp;</td>
      </tr>

      <tr>
        <td>Billing</td>

        <td>Monthly invoice with a summary&nbsp;</td>

        <td>Detailed monthly invoice&nbsp;</td>
      </tr>
    </tbody>
  </table>`;

const courseComparison = `<table style="border-collapse: collapse; width: 100.02%; border: 1px solid black; height: 192px">
    <colgroup>
      <col style="width: 33.2998%" />
      <col style="width: 33.2998%" />
      <col style="width: 33.2998%" />
    </colgroup>

    <tbody>
      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">Feature&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Self-paced Course&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Guided Course&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">Customisation&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Choose your own topics&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Follow a structured programme with optional topics&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">Support&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Community discussion board&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Instructor feedback, group sessions, and office hours&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">Learning Goals&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Set your own goals&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Weekly objectives, practical exercises, and a final project&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">Progress Tracking&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Personal notes&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Lesson checklist, feedback, and progress summaries&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">Check-ins&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Review at your own pace&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Weekly sessions and reminders&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">Learning Materials&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Public articles&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Recorded lessons and downloadable worksheets&nbsp;</td>
      </tr>

      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">Topics Covered&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">General introductions&nbsp;</td>

        <td style="border: 1px solid black; height: 24px">Writing, design, research, teamwork, and presentations&nbsp;</td>
      </tr>
    </tbody>
  </table>`;

const departmentBudgetPlain = `<table style="border-collapse: collapse; width: 100.055%" border="1">
    <colgroup>
      <col style="width: 40%" />
      <col style="width: 20%" />
      <col style="width: 25%" />
      <col style="width: 15%" />
    </colgroup>

    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Department</strong></td>

        <td style="border: 1px solid black"><strong>Planned (USD)</strong></td>

        <td style="border: 1px solid black"><strong>Actual (USD)</strong></td>

        <td style="border: 1px solid black"><strong>Change (%)</strong></td>
      </tr>

      <tr>
        <td style="border: 1px solid black">Customer Support</td>

        <td style="border: 1px solid black">
          $80,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >2</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">
          $84,000<a
            href="https://example.com/sample-budget"
            target="_blank"
            rel="noopener"
            ><span style="color: rgb(68, 79, 171)"><sup>2</sup></span></a
          >
        </td>

        <td style="border: 1px solid black">5.0</td>
      </tr>

      <tr>
        <td style="border: 1px solid black">Product Development</td>

        <td style="border: 1px solid black">
          $120,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >3</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">
          $132,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >3</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">10.0</td>
      </tr>

      <tr>
        <td style="border: 1px solid black">Marketing and Events</td>

        <td style="border: 1px solid black">
          $60,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >4</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">
          $63,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >4</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">5.0</td>
      </tr>

      <tr>
        <td style="border: 1px solid black">Business Operations&nbsp;</td>

        <td style="border: 1px solid black">
          $100,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >5</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">
          $108,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >5</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black">8.0</td>
      </tr>
    </tbody>
  </table>`;

const departmentBudgetSpacedRepeat = `<table style="border-collapse: collapse; width: 100.055%; height: 216px" border="1">
    <colgroup>
      <col style="width: 40%" />
      <col style="width: 20%" />
      <col style="width: 25%" />
      <col style="width: 15%" />
    </colgroup>

    <tbody>
      <tr style="height: 24px">
        <td style="border: 1px solid black; height: 24px">
          <strong>Department<br /><br /></strong>
        </td>

        <td style="border: 1px solid black; height: 24px"><strong>Planned (USD)</strong></td>

        <td style="border: 1px solid black; height: 24px"><strong>Actual (USD)</strong></td>

        <td style="border: 1px solid black; height: 24px"><strong>Change (%)</strong></td>
      </tr>

      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Customer Support<br /><br /></td>

        <td style="border: 1px solid black; height: 48px">
          $80,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >2</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black; height: 48px">
          $84,000<a
            href="https://example.com/sample-budget"
            target="_blank"
            rel="noopener"
            ><span style="color: rgb(68, 79, 171)"><sup>2</sup></span></a
          >
        </td>

        <td style="border: 1px solid black; height: 48px">5.0</td>
      </tr>

      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Product Development<br /><br /></td>

        <td style="border: 1px solid black; height: 48px">
          $120,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >3</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black; height: 48px">
          $132,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >3</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black; height: 48px">10.0</td>
      </tr>

      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Marketing and Events<br /><br /></td>

        <td style="border: 1px solid black; height: 48px">
          $60,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >4</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black; height: 48px">
          $63,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >4</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black; height: 48px">5.0</td>
      </tr>

      <tr style="height: 48px">
        <td style="border: 1px solid black; height: 48px">Business Operations&nbsp;<br /><br /></td>

        <td style="border: 1px solid black; height: 48px">
          $100,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >5</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black; height: 48px">
          $108,000<sup
            ><span style="color: rgb(68, 79, 171)"
              ><a
                href="https://example.com/sample-budget"
                target="_blank"
                rel="noopener"
                >5</a
              ></span
            ></sup
          >
        </td>

        <td style="border: 1px solid black; height: 48px">8.0</td>
      </tr>
    </tbody>
  </table>`;

const deliveryMethods = `<table style="border-collapse: collapse; width: 99.9442%; height: 120px; border: 1px solid rgb(0, 0, 0)" border="1">
    <colgroup>
      <col style="width: 19.9721%" />
      <col style="width: 19.9721%" />
      <col style="width: 19.9721%" />
      <col style="width: 19.9721%" />
      <col style="width: 19.9721%" />
    </colgroup>

    <tbody>
      <tr style="height: 24px">
        <td style="height: 24px; border-color: rgb(0, 0, 0)"><strong>Method</strong></td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)"><strong>Cost&nbsp;</strong></td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)"><strong>Time&nbsp;</strong></td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)"><strong>Tracking&nbsp;</strong></td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)"><strong>Availability&nbsp;</strong></td>
      </tr>

      <tr style="height: 24px">
        <td style="height: 24px; border-color: rgb(0, 0, 0)">Standard Delivery&nbsp;</td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)">Low</td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)">Next day</td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)">Basic</td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)">Weekdays</td>
      </tr>

      <tr style="height: 24px">
        <td style="height: 24px; border-color: rgb(0, 0, 0)">Express Delivery&nbsp;</td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)">Medium</td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)">Same day</td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)">Detailed</td>

        <td style="height: 24px; border-color: rgb(0, 0, 0)">Every day</td>
      </tr>

      <tr style="height: 48px">
        <td style="height: 48px; border-color: rgb(0, 0, 0)">Scheduled Delivery&nbsp;</td>

        <td style="height: 48px; border-color: rgb(0, 0, 0)">Medium-High</td>

        <td style="height: 48px; border-color: rgb(0, 0, 0)">Chosen slot</td>

        <td style="height: 48px; border-color: rgb(0, 0, 0)">Detailed</td>

        <td style="height: 48px; border-color: rgb(0, 0, 0)">By appointment</td>
      </tr>
    </tbody>
  </table>`;

// ---------------------------------------------------------------------------
// Edge cases — tables that stress the layout heuristics rather than model real
// content. Each one isolates a single hostile trait so a regression is easy to
// attribute.
// ---------------------------------------------------------------------------

const colspanHeader = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 25%" />
      <col style="width: 25%" />
      <col style="width: 25%" />
      <col style="width: 25%" />
    </colgroup>
    <tbody>
      <tr>
        <td colspan="4" style="border: 1px solid black; text-align: center"><strong>Quarterly Revenue &mdash; All Regions</strong></td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid black"><strong>North America</strong></td>
        <td colspan="2" style="border: 1px solid black"><strong>EMEA</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Q1</td>
        <td style="border: 1px solid black">Q2</td>
        <td style="border: 1px solid black">Q1</td>
        <td style="border: 1px solid black">Q2</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">$1.2M</td>
        <td style="border: 1px solid black">$1.9M</td>
        <td style="border: 1px solid black">$0.8M</td>
        <td style="border: 1px solid black">$1.1M</td>
      </tr>
      <tr>
        <td colspan="3" style="border: 1px solid black">Subtotal (three columns merged)</td>
        <td style="border: 1px solid black">$5.0M</td>
      </tr>
    </tbody>
  </table>`;

const rowspanCategories = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 20%" />
      <col style="width: 45%" />
      <col style="width: 35%" />
    </colgroup>
    <tbody>
      <tr>
        <td rowspan="3" style="border: 1px solid black; vertical-align: middle"><strong>Workshops</strong></td>
        <td style="border: 1px solid black">Introduction to Design</td>
        <td style="border: 1px solid black">$180/session</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Creative Writing</td>
        <td style="border: 1px solid black">$95/session</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Team Communication</td>
        <td style="border: 1px solid black">$320/session</td>
      </tr>
      <tr>
        <td rowspan="2" style="border: 1px solid black; vertical-align: middle"><strong>Consultations</strong></td>
        <td style="border: 1px solid black">One-to-one session</td>
        <td style="border: 1px solid black">$120/hour</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Group session</td>
        <td style="border: 1px solid black">$70/hour</td>
      </tr>
    </tbody>
  </table>`;

const spanMatrix = `<table style="border-collapse: collapse; width: 100%" border="1">
    <tbody>
      <tr>
        <td rowspan="2" colspan="2" style="border: 1px solid black; text-align: center"><strong>2&times;2 corner block</strong></td>
        <td style="border: 1px solid black">C1</td>
        <td style="border: 1px solid black">D1</td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid black">C2 + D2 merged</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">A3</td>
        <td rowspan="2" style="border: 1px solid black">B3 spans down</td>
        <td style="border: 1px solid black">C3</td>
        <td rowspan="2" style="border: 1px solid black">D3 spans down too</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">A4</td>
        <td style="border: 1px solid black">C4</td>
      </tr>
    </tbody>
  </table>`;

const theadFootCaption = `<table style="border-collapse: collapse; width: 100%" border="1">
    <caption style="caption-side: top; padding-bottom: 6px"><strong>Table 7.</strong> Sample schedule by activity.</caption>
    <colgroup>
      <col style="width: 40%" />
      <col style="width: 30%" />
      <col style="width: 30%" />
    </colgroup>
    <thead>
      <tr>
        <th style="border: 1px solid black">Activity</th>
        <th style="border: 1px solid black">Duration</th>
        <th style="border: 1px solid black">Format</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid black">Welcome session</td>
        <td style="border: 1px solid black">30 minutes</td>
        <td style="border: 1px solid black">Presentation</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Hands-on workshop</td>
        <td style="border: 1px solid black">90 minutes</td>
        <td style="border: 1px solid black">Small groups</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Closing discussion</td>
        <td style="border: 1px solid black">20 minutes</td>
        <td style="border: 1px solid black">Open forum</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="border: 1px solid black">Times are illustrative; adjust the schedule to suit your group.</td>
      </tr>
    </tfoot>
  </table>`;

const nestedTable = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 30%" />
      <col style="width: 70%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Plan</strong></td>
        <td style="border: 1px solid black"><strong>Breakdown</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Starter</td>
        <td style="border: 1px solid black">
          <table style="border-collapse: collapse; width: 100%" border="1">
            <tbody>
              <tr>
                <td style="border: 1px solid #888">Base</td>
                <td style="border: 1px solid #888">$49</td>
              </tr>
              <tr>
                <td style="border: 1px solid #888">Per participant</td>
                <td style="border: 1px solid #888">$0.35</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Enterprise</td>
        <td style="border: 1px solid black">
          <table style="border-collapse: collapse; width: 100%" border="1">
            <tbody>
              <tr>
                <td style="border: 1px solid #888">Base</td>
                <td style="border: 1px solid #888">Negotiated</td>
                <td style="border: 1px solid #888">
                  <table style="border-collapse: collapse; width: 100%" border="1">
                    <tbody>
                      <tr><td style="border: 1px solid #bbb">third level</td></tr>
                      <tr><td style="border: 1px solid #bbb">of nesting</td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>`;

const singleCell = `<table style="border-collapse: collapse; width: 100%" border="1">
    <tbody>
      <tr>
        <td style="border: 1px solid black; padding: 12px; text-align: center">One cell, one row, one column &mdash; the degenerate case.</td>
      </tr>
    </tbody>
  </table>`;

const wideTwelveColumns = `<table style="border-collapse: collapse; width: 100%" border="1">
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Jan</strong></td>
        <td style="border: 1px solid black"><strong>Feb</strong></td>
        <td style="border: 1px solid black"><strong>Mar</strong></td>
        <td style="border: 1px solid black"><strong>Apr</strong></td>
        <td style="border: 1px solid black"><strong>May</strong></td>
        <td style="border: 1px solid black"><strong>Jun</strong></td>
        <td style="border: 1px solid black"><strong>Jul</strong></td>
        <td style="border: 1px solid black"><strong>Aug</strong></td>
        <td style="border: 1px solid black"><strong>Sep</strong></td>
        <td style="border: 1px solid black"><strong>Oct</strong></td>
        <td style="border: 1px solid black"><strong>Nov</strong></td>
        <td style="border: 1px solid black"><strong>Dec</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">112</td>
        <td style="border: 1px solid black">98</td>
        <td style="border: 1px solid black">140</td>
        <td style="border: 1px solid black">131</td>
        <td style="border: 1px solid black">156</td>
        <td style="border: 1px solid black">149</td>
        <td style="border: 1px solid black">163</td>
        <td style="border: 1px solid black">171</td>
        <td style="border: 1px solid black">158</td>
        <td style="border: 1px solid black">144</td>
        <td style="border: 1px solid black">139</td>
        <td style="border: 1px solid black">187</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">+4%</td>
        <td style="border: 1px solid black">-12%</td>
        <td style="border: 1px solid black">+43%</td>
        <td style="border: 1px solid black">-6%</td>
        <td style="border: 1px solid black">+19%</td>
        <td style="border: 1px solid black">-4%</td>
        <td style="border: 1px solid black">+9%</td>
        <td style="border: 1px solid black">+5%</td>
        <td style="border: 1px solid black">-8%</td>
        <td style="border: 1px solid black">-9%</td>
        <td style="border: 1px solid black">-3%</td>
        <td style="border: 1px solid black">+34%</td>
      </tr>
    </tbody>
  </table>`;

const emptyCells = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 25%" />
      <col style="width: 25%" />
      <col style="width: 25%" />
      <col style="width: 25%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Filled</strong></td>
        <td style="border: 1px solid black"></td>
        <td style="border: 1px solid black">&nbsp;</td>
        <td style="border: 1px solid black"><strong>Filled</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black"></td>
        <td style="border: 1px solid black"></td>
        <td style="border: 1px solid black"></td>
        <td style="border: 1px solid black"></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">&nbsp;</td>
        <td style="border: 1px solid black"><br /></td>
        <td style="border: 1px solid black">value</td>
        <td style="border: 1px solid black">&nbsp;&nbsp;&nbsp;</td>
      </tr>
    </tbody>
  </table>`;

const unbreakableContent = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 30%" />
      <col style="width: 70%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Kind</strong></td>
        <td style="border: 1px solid black"><strong>Value</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Long URL</td>
        <td style="border: 1px solid black">https://projects.example.com/api/v2/workspaces/8f2c4d1e-5b7a-4c93-a0f1-2d6e8b4c9a37/activity-feed?includeCompleted=true&amp;expand=participants</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Hash</td>
        <td style="border: 1px solid black">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">German</td>
        <td style="border: 1px solid black">Veranstaltungsplanungsdienstleistungsvertragsbedingungen</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Path</td>
        <td style="border: 1px solid black">/usr/local/example/projects/website-redesign/resources/illustrations/homepage/banner-000241.settings.json</td>
      </tr>
    </tbody>
  </table>`;

const pixelColgroupOverflow = `<table style="border-collapse: collapse; width: 1400px" border="1">
    <colgroup>
      <col style="width: 420px" />
      <col style="width: 380px" />
      <col style="width: 300px" />
      <col style="width: 300px" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Venue</strong></td>
        <td style="border: 1px solid black"><strong>Address</strong></td>
        <td style="border: 1px solid black"><strong>Capacity</strong></td>
        <td style="border: 1px solid black"><strong>Utilisation</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Riverside Hall</td>
        <td style="border: 1px solid black">12 Example Avenue, Sample City</td>
        <td style="border: 1px solid black">240 seats</td>
        <td style="border: 1px solid black">87%</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Garden Studio</td>
        <td style="border: 1px solid black">34 Sample Street, Example Town</td>
        <td style="border: 1px solid black">80 seats</td>
        <td style="border: 1px solid black">61%</td>
      </tr>
    </tbody>
  </table>`;

const colgroupSpanAttr = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup span="2" style="width: 15%"></colgroup>
    <colgroup>
      <col span="2" style="width: 20%" />
      <col style="width: 30%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black">A</td>
        <td style="border: 1px solid black">B</td>
        <td style="border: 1px solid black">C</td>
        <td style="border: 1px solid black">D</td>
        <td style="border: 1px solid black">E</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Two columns declared by a bare colgroup span</td>
        <td style="border: 1px solid black">second</td>
        <td style="border: 1px solid black">Two more declared by a col span</td>
        <td style="border: 1px solid black">fourth</td>
        <td style="border: 1px solid black">The remainder</td>
      </tr>
    </tbody>
  </table>`;

const legacyAttributes = `<table width="100%" border="1" cellpadding="6" cellspacing="0" align="center">
    <tbody>
      <tr bgcolor="#eef1f5">
        <th width="120" align="left">SKU</th>
        <th width="40%" align="left">Description</th>
        <th align="right">Unit</th>
      </tr>
      <tr>
        <td align="left">NB-1200</td>
        <td align="left">Lined notebook with a soft cover</td>
        <td align="right" nowrap="nowrap">$2.40</td>
      </tr>
      <tr>
        <td align="left">PN-3000</td>
        <td align="left">Refillable ballpoint pen with a comfortable grip</td>
        <td align="right" nowrap="nowrap">$4.15</td>
      </tr>
      <tr>
        <td align="left">PAD-99</td>
        <td align="left">Colourful sticky notes, pack of 12</td>
        <td align="right" nowrap="nowrap">$18.00</td>
      </tr>
    </tbody>
  </table>`;

const listsInCells = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 35%" />
      <col style="width: 65%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Phase</strong></td>
        <td style="border: 1px solid black"><strong>Deliverables</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Onboarding</td>
        <td style="border: 1px solid black">
          <ul>
            <li>Project overview</li>
            <li>Account setup</li>
            <li>Team introductions</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Planning</td>
        <td style="border: 1px solid black">
          <ol>
            <li>Choose milestone dates</li>
            <li>
              Assign tasks by team
              <ul>
                <li>Finance</li>
                <li>Legal</li>
              </ul>
            </li>
            <li>Review the project checklist</li>
          </ol>
        </td>
      </tr>
    </tbody>
  </table>`;

const alignmentMatrix = `<table style="border-collapse: collapse; width: 100%; height: 260px" border="1">
    <colgroup>
      <col style="width: 33.33%" />
      <col style="width: 33.33%" />
      <col style="width: 33.34%" />
    </colgroup>
    <tbody>
      <tr style="height: 90px">
        <td style="border: 1px solid black; text-align: left; vertical-align: top">top / left</td>
        <td style="border: 1px solid black; text-align: center; vertical-align: top">top / center</td>
        <td style="border: 1px solid black; text-align: right; vertical-align: top">top / right</td>
      </tr>
      <tr style="height: 90px">
        <td style="border: 1px solid black; text-align: left; vertical-align: middle">middle / left</td>
        <td style="border: 1px solid black; text-align: center; vertical-align: middle">middle / center</td>
        <td style="border: 1px solid black; text-align: right; vertical-align: middle">middle / right</td>
      </tr>
      <tr style="height: 80px">
        <td style="border: 1px solid black; text-align: justify; vertical-align: bottom">bottom / justify &mdash; a longer run of text so justification has something to spread across the available width</td>
        <td style="border: 1px solid black; text-align: center; vertical-align: bottom">bottom / center</td>
        <td style="border: 1px solid black; text-align: right; vertical-align: bottom">bottom / right</td>
      </tr>
    </tbody>
  </table>`;

const inlineFormattingStew = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 45%" />
      <col style="width: 55%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Notation</strong></td>
        <td style="border: 1px solid black"><strong>Rendered</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Nested emphasis</td>
        <td style="border: 1px solid black"><strong>bold <em>and italic <u>and underlined <s>and struck</s></u></em></strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Scripts</td>
        <td style="border: 1px solid black">H<sub>2</sub>O, E = mc<sup>2</sup>, x<sup>n<sup>k</sup></sup></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Size shifts</td>
        <td style="border: 1px solid black"><span style="font-size: 28px">big</span> <small>small</small> <span style="font-size: 9px">tiny</span> <span style="font-size: 28px">big again</span></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Mixed weights</td>
        <td style="border: 1px solid black"><span style="font-weight: 100">100</span> <span style="font-weight: 400">400</span> <span style="font-weight: 700">700</span> <span style="font-weight: 900">900</span></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Marks &amp; code</td>
        <td style="border: 1px solid black"><mark>highlighted</mark> <code>inline_code()</code> <abbr title="Frequently Asked Questions">FAQ</abbr></td>
      </tr>
    </tbody>
  </table>`;

const preformattedCode = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 25%" />
      <col style="width: 75%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Endpoint</strong></td>
        <td style="border: 1px solid black"><strong>Payload</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">POST /events</td>
        <td style="border: 1px solid black"><pre>{
  "venue": "MAIN-HALL",
  "attendees": 128,
  "window": ["2026-10-02T08:00", "2026-10-02T12:00"]
}</pre></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">GET /events</td>
        <td style="border: 1px solid black"><pre>curl -H "Authorization: Bearer $TOKEN" \\
  https://api.example.com/events?from=2026-01-01</pre></td>
      </tr>
    </tbody>
  </table>`;

const internationalText = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 30%" />
      <col style="width: 40%" />
      <col style="width: 30%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>Locale</strong></td>
        <td style="border: 1px solid black"><strong>Sample</strong></td>
        <td style="border: 1px solid black"><strong>Status</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">ja-JP</td>
        <td style="border: 1px solid black">毎週さまざまなイベントやワークショップを開催しています。</td>
        <td style="border: 1px solid black">✅ 対応済</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">ar-SA</td>
        <td style="border: 1px solid black" dir="rtl">نقدم ورش عمل وأنشطة متنوعة لجميع المشاركين.</td>
        <td style="border: 1px solid black">⏳ قيد المراجعة</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">he-IL</td>
        <td style="border: 1px solid black" dir="rtl">מגוון סדנאות ופעילויות לכל המשתתפים.</td>
        <td style="border: 1px solid black">❌</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">emoji</td>
        <td style="border: 1px solid black">🎨🌍🎵🚲🌻🍎 👨‍👩‍👧‍👦 🇵🇱🇯🇵</td>
        <td style="border: 1px solid black">🆗</td>
      </tr>
    </tbody>
  </table>`;

const conflictingWidths = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 10%" />
      <col style="width: 10%" />
      <col style="width: 80%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black; width: 70%"><strong>colgroup says 10%, style says 70%</strong></td>
        <td style="border: 1px solid black; width: 240px"><strong>colgroup says 10%, style says 240px</strong></td>
        <td width="50" style="border: 1px solid black"><strong>colgroup says 80%, attribute says 50</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">short</td>
        <td style="border: 1px solid black">short</td>
        <td style="border: 1px solid black">A genuinely long cell that would prefer most of the table width if the heuristics were free to choose.</td>
      </tr>
    </tbody>
  </table>`;

const separateBorders = `<table style="border-collapse: separate; border-spacing: 8px 12px; width: 100%; border: 3px double #5762ce">
    <colgroup>
      <col style="width: 50%" />
      <col style="width: 50%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 2px dashed #5762ce; padding: 8px"><strong>border-spacing 8px / 12px</strong></td>
        <td style="border: 2px dotted #cc5555; padding: 8px"><strong>mixed border styles</strong></td>
      </tr>
      <tr>
        <td style="border: 4px solid #333; padding: 8px">Thick solid</td>
        <td style="border-left: 6px solid #5762ce; border-right: 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 8px">Asymmetric borders, none on the right</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ccc; border-radius: 12px; padding: 8px">Rounded corners</td>
        <td style="border: none; padding: 8px">No border at all</td>
      </tr>
    </tbody>
  </table>`;

const headerOnlyGrid = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 20%" />
      <col style="width: 20%" />
      <col style="width: 20%" />
      <col style="width: 20%" />
      <col style="width: 20%" />
    </colgroup>
    <thead>
      <tr>
        <th style="border: 1px solid black">Mon</th>
        <th style="border: 1px solid black">Tue</th>
        <th style="border: 1px solid black">Wed</th>
        <th style="border: 1px solid black">Thu</th>
        <th style="border: 1px solid black">Fri</th>
      </tr>
      <tr>
        <th style="border: 1px solid black" scope="row">Route A</th>
        <th style="border: 1px solid black">Route B</th>
        <th style="border: 1px solid black">Route C</th>
        <th style="border: 1px solid black">Route D</th>
        <th style="border: 1px solid black">Route E</th>
      </tr>
    </thead>
  </table>`;

const tallTwentyRows = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 18%" />
      <col style="width: 52%" />
      <col style="width: 30%" />
    </colgroup>
    <thead>
      <tr>
        <th style="border: 1px solid black">Task</th>
        <th style="border: 1px solid black">Description</th>
        <th style="border: 1px solid black">Due date</th>
      </tr>
    </thead>
    <tbody>
      ${Array.from({ length: 20 }, (_, i) => {
        const n = String(i + 1).padStart(4, '0');
        return `<tr>
        <td style="border: 1px solid black">TSK-${n}</td>
        <td style="border: 1px solid black">${
          i % 3 === 0
            ? 'Review the project brief, gather feedback from the team, and prepare a summary'
            : i % 3 === 1
              ? 'Update meeting notes'
              : 'Send invitations'
        }</td>
        <td style="border: 1px solid black">20${30 + (i % 9)}-0${(i % 9) + 1}-15</td>
      </tr>`;
      }).join('\n      ')}
    </tbody>
  </table>`;

const blockContentInCells = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 40%" />
      <col style="width: 60%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black">
          <h3 style="margin: 0 0 6px">Heading inside a cell</h3>
          <p style="margin: 0 0 6px">A paragraph with its own bottom margin.</p>
          <p style="margin: 0">A second paragraph, to see whether margins collapse.</p>
        </td>
        <td style="border: 1px solid black">
          <blockquote style="margin: 0 0 8px 12px; border-left: 3px solid #5762ce; padding-left: 8px">A block quote nested in a table cell, which the WebView renderer indents and the native one may not.</blockquote>
          <hr />
          <div style="background: #eef1f5; padding: 10px">A div with its own background and padding.</div>
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid black">
          <div style="display: flex; justify-content: space-between"><span>flex left</span><span>flex right</span></div>
        </td>
        <td style="border: 1px solid black">
          <p style="margin: 0">Trailing content after a row of block children.</p>
        </td>
      </tr>
    </tbody>
  </table>`;

const zeroAndTinyColumns = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 0%" />
      <col style="width: 1%" />
      <col style="width: 4%" />
      <col style="width: 95%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black">0%</td>
        <td style="border: 1px solid black">1%</td>
        <td style="border: 1px solid black">4%</td>
        <td style="border: 1px solid black">95% &mdash; the column that gets everything</td>
      </tr>
      <tr>
        <td style="border: 1px solid black">Nevertheless this cell has a good deal of text in it</td>
        <td style="border: 1px solid black">x</td>
        <td style="border: 1px solid black">1,234,567</td>
        <td style="border: 1px solid black">short</td>
      </tr>
    </tbody>
  </table>`;

const overflowingPercents = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 60%" />
      <col style="width: 60%" />
      <col style="width: 60%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black"><strong>60%</strong></td>
        <td style="border: 1px solid black"><strong>60%</strong></td>
        <td style="border: 1px solid black"><strong>60%</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid black">The declared widths sum to 180%.</td>
        <td style="border: 1px solid black">Both renderers have to normalise something.</td>
        <td style="border: 1px solid black">Do they agree on what?</td>
      </tr>
    </tbody>
  </table>`;

const imagesInCells = `<table style="border-collapse: collapse; width: 100%" border="1">
    <colgroup>
      <col style="width: 30%" />
      <col style="width: 70%" />
    </colgroup>
    <tbody>
      <tr>
        <td style="border: 1px solid black; text-align: center"><img src="https://via.placeholder.com/120x60/5762ce/ffffff?text=120x60" width="120" height="60" alt="120 by 60" /></td>
        <td style="border: 1px solid black">Intrinsically sized image, 120&times;60, declared via attributes.</td>
      </tr>
      <tr>
        <td style="border: 1px solid black; text-align: center"><img src="https://via.placeholder.com/800x200/243445/ffffff?text=800x200" alt="800 by 200" /></td>
        <td style="border: 1px solid black">An 800px-wide image with no declared size in a column that is far narrower.</td>
      </tr>
      <tr>
        <td style="border: 1px solid black; text-align: center"><img src="https://example.invalid/missing.png" width="80" height="80" alt="broken image placeholder" /></td>
        <td style="border: 1px solid black">A source that will never load &mdash; does the row still reserve its height?</td>
      </tr>
    </tbody>
  </table>`;

const whitespaceSensitive = `<table style="border-collapse: collapse; width: 100%" border="1"><colgroup><col style="width:50%"/><col style="width:50%"/></colgroup><tbody><tr><td style="border: 1px solid black">   Leading and trailing spaces in the source   </td><td style="border: 1px solid black">
          A cell whose text is split
          across several source lines
          with generous indentation
        </td></tr><tr><td style="border: 1px solid black; white-space: pre">white-space: pre
  keeps   these
  line breaks</td><td style="border: 1px solid black; white-space: nowrap">white-space: nowrap on a sentence that is comfortably longer than its column</td></tr></tbody></table>`;

export const tables = [
  {
    title: 'Department budget',
    subtitle:
      '4 columns, percent colgroup, explicit row heights, cells padded with <br />.',
    html: departmentBudgetSpaced
  },
  {
    title: 'Department budget (bare)',
    subtitle:
      'The same sample budget without the padded, red-bordered wrapper div.',
    html: departmentBudgetSpacedBare
  },
  {
    title: 'Individual vs team planning',
    subtitle: '2 equal columns, explicit row heights, short cells.',
    html: planningComparison
  },
  {
    title: 'Project features checklist',
    subtitle:
      'Borderless, no colgroup, a fixed 40px icon column next to a free-flowing one.',
    html: valuePropChecklist
  },
  {
    title: 'Department budget (fractional colgroup)',
    subtitle:
      'Same data, but the colgroup uses fractional percentages that do not sum to 100.',
    html: departmentBudgetFractionalCols
  },
  {
    title: 'Project milestones',
    subtitle:
      '2 equal columns, border declared on the table element rather than per cell.',
    html: projectMilestones
  },
  {
    title: 'Basic vs plus plan',
    subtitle:
      '3 equal columns, no height hints, cells wrap onto several lines.',
    html: servicePlanComparison
  },
  {
    title: 'Self-paced vs guided course',
    subtitle:
      '3 equal columns with long wrapping cells and row heights that understate them.',
    html: courseComparison
  },
  {
    title: 'Department budget (no row heights)',
    subtitle: 'Percent colgroup with no height hints and no <br /> padding.',
    html: departmentBudgetPlain
  },
  {
    title: 'Department budget (repeat)',
    subtitle:
      'Repeated sample budget with explicit heights and line-break padding.',
    html: departmentBudgetSpacedRepeat
  },
  {
    title: 'Delivery options',
    subtitle:
      '5 columns, the widest table of the set — the hardest case for both renderers.',
    html: deliveryMethods
  },
  {
    title: 'Colspan header bands',
    subtitle:
      'Every row merges a different number of columns, including a full-width banner row.',
    html: colspanHeader
  },
  {
    title: 'Rowspan category column',
    subtitle:
      'The first column spans three then two rows, so the grid is no longer rectangular.',
    html: rowspanCategories
  },
  {
    title: 'Colspan + rowspan matrix',
    subtitle:
      'A 2x2 corner block plus two vertical spans — cells arrive out of grid order.',
    html: spanMatrix
  },
  {
    title: 'caption + thead + tfoot',
    subtitle:
      'Sectioning elements and a caption, with a full-width footer row.',
    html: theadFootCaption
  },
  {
    title: 'Nested tables, three deep',
    subtitle:
      'A table inside a cell inside a cell — width has to be re-derived at each level.',
    html: nestedTable
  },
  {
    title: 'Single cell',
    subtitle: 'One row, one column: the degenerate case.',
    html: singleCell
  },
  {
    title: 'Twelve narrow columns',
    subtitle:
      'No colgroup, twelve columns of short numbers on a phone-width viewport.',
    html: wideTwelveColumns
  },
  {
    title: 'Empty and whitespace-only cells',
    subtitle:
      'Truly empty cells, &nbsp;-only cells, and a row with nothing in it at all.',
    html: emptyCells
  },
  {
    title: 'Unbreakable content',
    subtitle:
      'Long URLs, a SHA-256 digest and a German compound that cannot wrap.',
    html: unbreakableContent
  },
  {
    title: 'Pixel colgroup wider than the viewport',
    subtitle:
      'A 1400px table with px column widths, rendered into a much narrower container.',
    html: pixelColgroupOverflow
  },
  {
    title: 'colgroup span / col span',
    subtitle: 'Columns declared by span attributes rather than one <col> each.',
    html: colgroupSpanAttr
  },
  {
    title: 'Legacy presentational attributes',
    subtitle:
      'width, align, bgcolor, cellpadding, cellspacing and nowrap instead of CSS.',
    html: legacyAttributes
  },
  {
    title: 'Lists inside cells',
    subtitle: 'Bulleted, numbered and nested lists as cell content.',
    html: listsInCells
  },
  {
    title: 'Alignment matrix',
    subtitle:
      'Every combination of text-align and vertical-align against fixed row heights.',
    html: alignmentMatrix
  },
  {
    title: 'Inline formatting stew',
    subtitle:
      'Nested emphasis, sub/sup, wild font-size shifts and the full weight scale in one column.',
    html: inlineFormattingStew
  },
  {
    title: 'Preformatted blocks in cells',
    subtitle:
      '<pre> content whose intrinsic width is set by the longest source line.',
    html: preformattedCode
  },
  {
    title: 'CJK, RTL and emoji',
    subtitle:
      'Scripts that wrap by different rules, plus multi-codepoint emoji sequences.',
    html: internationalText
  },
  {
    title: 'Conflicting width declarations',
    subtitle:
      'colgroup, inline style and the width attribute disagree on every column.',
    html: conflictingWidths
  },
  {
    title: 'Separate borders and spacing',
    subtitle:
      'border-collapse: separate with border-spacing, mixed border styles and radii.',
    html: separateBorders
  },
  {
    title: 'Header-only grid',
    subtitle: 'A thead with no tbody — every cell is a <th>.',
    html: headerOnlyGrid
  },
  {
    title: 'Twenty rows',
    subtitle:
      'A long body with alternating cell lengths, to check row-height drift.',
    html: tallTwentyRows
  },
  {
    title: 'Block content in cells',
    subtitle:
      'Headings, paragraphs with margins, a blockquote, an <hr /> and a flex row.',
    html: blockContentInCells
  },
  {
    title: 'Zero and near-zero columns',
    subtitle: 'Columns declared at 0%, 1% and 4% next to one claiming 95%.',
    html: zeroAndTinyColumns
  },
  {
    title: 'Percentages summing to 180%',
    subtitle: 'Three columns each asking for 60% of the table.',
    html: overflowingPercents
  },
  {
    title: 'Images in cells',
    subtitle:
      'An intrinsically sized image, an oversized one with no dimensions, and a broken source.',
    html: imagesInCells
  },
  {
    title: 'Whitespace-sensitive cells',
    subtitle:
      'Source indentation, white-space: pre and white-space: nowrap inside cells.',
    html: whitespaceSensitive
  }
];

export const realTable = wrap(
  tables.map(({ html }) => html).join(`\n  ${SPACER}\n  `)
);

const sharedTagsStyles = {
  a: {
    color: '#419edc',
    textDecorationColor: '#419edc'
  }
};

const webViewConfig = {
  renderers: { table },
  WebView,
  renderersProps: {
    table: {
      animationType: 'animated',
      tableStyleSpecs: {
        outerBorderWidthPx: 1,
        rowsBorderWidthPx: 1,
        columnsBorderWidthPx: 1
      }
    }
  },
  tagsStyles: {
    ...sharedTagsStyles,
    table: {
      flex: 1
    }
  },
  defaultWebViewProps: {}
};

const heuristicConfig = {
  renderers: heuristicTableRenderers,
  customHTMLElementModels: {
    colgroup: colgroupModel
  },
  renderersProps: {
    table: {
      forceStretch: false,
      baseFontCoeff: 0.55,
      // Treat an explicit `height` on the table or any cell as a minimum, so
      // every case here grows to fit content taller than the markup asked for.
      growBeyondHeight: true,
      // Real bold faces run a few percent wider than regular, not a third
      // wider, which is what the library defaults assume.
      fontWeightCoeffs: {
        100: 0.7,
        200: 0.8,
        300: 0.9,
        400: 1,
        500: 1.1,
        600: 1.2,
        700: 1.3,
        800: 1.4,
        900: 1.5,
        bold: 1.3
      },
      getStyleForCell(cell) {
        return cell.tnode.tagName === 'td'
          ? {
              backgroundColor:
                cell.y % 2 > 0
                  ? 'rgba(65, 91, 118, .02)'
                  : 'rgba(65, 91, 118, .10)'
            }
          : null;
      }
    }
  },
  tagsStyles: {
    ...sharedTagsStyles,
    table: {
      borderColor: '#dfdfdf',
      borderWidth: 0.5,
      marginVertical: 10
    },
    th: {
      textAlign: 'center',
      backgroundColor: '#243445',
      color: '#fefefe',
      // padding: 5,
      borderColor: '#2f455b',
      borderWidth: 0.5
    },
    td: {
      textAlign: 'center',
      // padding: 2,
      borderColor: '#dfdfdf',
      borderWidth: 0.5
    }
  }
};

function Renderer({ label, config, html, availableWidth, onLinkPress, uid }) {
  return (
    <View style={styles.renderer}>
      <Text style={styles.rendererLabel}>{label}</Text>
      <RenderHTML
        key={uid}
        source={{ html }}
        contentWidth={availableWidth}
        enableExperimentalMarginCollapsing
        {...config}
        renderersProps={{
          a: { onPress: onLinkPress },
          ...config.renderersProps
        }}
        debug={false}
      />
    </View>
  );
}

function TableComparison({
  index,
  title,
  subtitle,
  html,
  instance,
  availableWidth,
  onLinkPress
}) {
  const source = wrap(html);
  return (
    <View style={styles.comparison}>
      <Text style={styles.comparisonTitle}>
        {index}. {title}
      </Text>
      <Text style={styles.comparisonSubtitle}>{subtitle}</Text>
      <Renderer
        label="@native-html/table-plugin (WebView)"
        config={webViewConfig}
        html={source}
        uid={`webview-${index}-${instance}`}
        availableWidth={availableWidth}
        onLinkPress={onLinkPress}
      />
      <Renderer
        label="@native-html/heuristic-table-plugin (native)"
        config={heuristicConfig}
        html={source}
        uid={`heuristic-${index}-${instance}`}
        availableWidth={availableWidth}
        onLinkPress={onLinkPress}
      />
    </View>
  );
}

export default function ComparisonExample({
  instance,
  onLinkPress,
  availableWidth
}) {
  return (
    <View>
      {tables.map(({ title, subtitle, html }, i) => (
        <TableComparison
          key={title}
          index={i + 1}
          title={title}
          subtitle={subtitle}
          html={html}
          instance={instance}
          availableWidth={availableWidth}
          onLinkPress={onLinkPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  comparison: {
    marginBottom: 40
  },
  comparisonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4
  },
  comparisonSubtitle: {
    marginBottom: 10,
    color: '#555'
  },
  renderer: {
    marginTop: 10
  },
  rendererLabel: {
    fontFamily: Platform.select({ default: 'monospace', ios: 'Menlo' }),
    fontSize: 12,
    color: '#243445',
    marginBottom: 4
  }
});
