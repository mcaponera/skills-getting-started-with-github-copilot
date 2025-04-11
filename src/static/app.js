document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activityTemplate = document.getElementById("activity-card-template").innerHTML;
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Fetch activities from the API
  fetch("/activities")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      return response.json();
    })
    .then((activities) => {
      activitiesList.innerHTML = ""; // Clear the loading message

      // Render each activity
      for (const [activityName, details] of Object.entries(activities)) {
        // Generate participants list HTML
        const participantsHTML = details.participants.length
          ? details.participants.map((participant) => `<li>${participant}</li>`).join("")
          : "<li>No participants yet</li>";

        // Replace placeholders in the template
        const activityHTML = activityTemplate
          .replace("{{activityName}}", activityName)
          .replace("{{description}}", details.description)
          .replace("{{schedule}}", details.schedule)
          .replace("{{participants}}", participantsHTML);

        activitiesList.innerHTML += activityHTML;

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = activityName;
        option.textContent = activityName;
        activitySelect.appendChild(option);
      }
    })
    .catch((error) => {
      activitiesList.innerHTML = `<p class="error">Error loading activities: ${error.message}</p>`;
    });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });
});
