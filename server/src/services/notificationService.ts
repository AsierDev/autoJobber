import nodemailer from 'nodemailer';
import { Op } from 'sequelize';
import JobApplication from '../models/JobApplication';
import User from '../models/User';

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
});

// Send follow-up reminder emails
export const sendFollowUpReminders = async (): Promise<void> => {
  try {
    const today = new Date();
    
    // Find applications with follow-up date today
    const applications = await JobApplication.findAll({
      where: {
        followUpDate: {
          [Op.gte]: new Date(today.setHours(0, 0, 0, 0)),
          [Op.lte]: new Date(today.setHours(23, 59, 59, 999)),
        },
        isActive: true,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });

    // Send email for each application
    for (const application of applications) {
      if (!application.user?.email) continue;

      const emailContent = {
        from: `"AutoJobber" <${process.env.EMAIL_FROM || 'noreply@autojobber.com'}>`,
        to: application.user.email,
        subject: `Reminder: Follow up for ${application.company} application`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Follow-up Reminder</h2>
            <p>Hello ${application.user.firstName || 'there'},</p>
            <p>This is a reminder to follow up on your job application at <strong>${application.company}</strong> for the <strong>${application.jobTitle}</strong> position.</p>
            <p><strong>Current Status:</strong> ${formatStatus(application.status)}</p>
            <p><strong>Application Date:</strong> ${new Date(application.applicationDate).toLocaleDateString()}</p>
            ${application.notes ? `<p><strong>Your Notes:</strong> ${application.notes}</p>` : ''}
            <hr>
            <p>Log in to your AutoJobber account to:</p>
            <ul>
              <li>Update the status of this application</li>
              <li>Set a new follow-up reminder</li>
              <li>Add notes about your follow-up</li>
            </ul>
            <p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/applications/${application.id}" style="background-color: #4a6cf7; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">View Application</a></p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">This is an automated message from AutoJobber. Please do not reply to this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(emailContent);
      console.log(`Sent follow-up reminder for application ${application.id} to ${application.user.email}`);
    }
  } catch (error) {
    console.error('Error sending follow-up reminders:', error);
  }
};

// Send weekly summary of job applications
export const sendWeeklySummary = async (): Promise<void> => {
  try {
    // Get all users
    const users = await User.findAll();
    
    for (const user of users) {
      // Get user's applications from the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const applications = await JobApplication.findAll({
        where: {
          userId: user.id,
          createdAt: {
            [Op.gte]: oneWeekAgo,
          },
        },
      });
      
      // Get upcoming follow-ups
      const upcomingFollowUps = await JobApplication.findAll({
        where: {
          userId: user.id,
          followUpDate: {
            [Op.gte]: new Date(),
            [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
          isActive: true,
        },
        order: [['followUpDate', 'ASC']],
      });
      
      // Count by status
      const statusCounts = await JobApplication.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
        where: {
          userId: user.id,
          isActive: true,
        },
        group: ['status'],
      });
      
      // Format status counts
      const formattedStatusCounts = statusCounts.reduce((acc, status) => {
        acc[status.status] = status.get('count');
        return acc;
      }, {} as Record<string, number>);
      
      // Skip if no activity
      if (applications.length === 0 && upcomingFollowUps.length === 0) {
        continue;
      }
      
      // Create email content
      const emailContent = {
        from: `"AutoJobber" <${process.env.EMAIL_FROM || 'noreply@autojobber.com'}>`,
        to: user.email,
        subject: 'Your Weekly Job Application Summary',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your Weekly Job Application Summary</h2>
            <p>Hello ${user.firstName || 'there'},</p>
            
            <h3>New Applications (Last 7 Days)</h3>
            ${applications.length === 0 ? '<p>No new applications in the past week.</p>' : `
              <p>You've submitted ${applications.length} new job application(s) in the past week:</p>
              <ul>
                ${applications.map(app => `
                  <li>
                    <strong>${app.company}</strong> - ${app.jobTitle}
                    <br><span style="color: #666;">${new Date(app.applicationDate).toLocaleDateString()} | Status: ${formatStatus(app.status)}</span>
                  </li>
                `).join('')}
              </ul>
            `}
            
            <h3>Current Application Status</h3>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Applied:</strong> ${formattedStatusCounts['applied'] || 0}</p>
              <p><strong>Interview:</strong> ${formattedStatusCounts['interview'] || 0}</p>
              <p><strong>Offer:</strong> ${formattedStatusCounts['offer'] || 0}</p>
              <p><strong>Rejected:</strong> ${formattedStatusCounts['rejected'] || 0}</p>
              <p><strong>Ghosted:</strong> ${formattedStatusCounts['ghosted'] || 0}</p>
              <p><strong>Withdrawn:</strong> ${formattedStatusCounts['withdrawn'] || 0}</p>
            </div>
            
            <h3>Upcoming Follow-ups</h3>
            ${upcomingFollowUps.length === 0 ? '<p>No follow-ups scheduled for the next 7 days.</p>' : `
              <p>You have ${upcomingFollowUps.length} follow-up(s) scheduled for the next 7 days:</p>
              <ul>
                ${upcomingFollowUps.map(app => `
                  <li>
                    <strong>${app.company}</strong> - ${app.jobTitle}
                    <br><span style="color: #666;">Follow-up on: ${new Date(app.followUpDate).toLocaleDateString()} | Status: ${formatStatus(app.status)}</span>
                  </li>
                `).join('')}
              </ul>
            `}
            
            <p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background-color: #4a6cf7; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">View Dashboard</a></p>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px;">You're receiving this email because you've enabled weekly summaries in your AutoJobber account settings. To unsubscribe, update your notification preferences in your account settings.</p>
          </div>
        `,
      };
      
      await transporter.sendMail(emailContent);
      console.log(`Sent weekly summary to ${user.email}`);
    }
  } catch (error) {
    console.error('Error sending weekly summaries:', error);
  }
};

// Format status for display
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    applied: 'Applied',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
    ghosted: 'No Response',
  };
  
  return statusMap[status] || status;
}; 