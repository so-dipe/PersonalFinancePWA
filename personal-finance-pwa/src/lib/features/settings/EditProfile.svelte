<script>
    import { onMount } from "svelte";
    import { PROFILE_PHOTOS } from "$lib/constants/constants";
    import { getSetting, setSetting } from "$lib/domains/settings";
    import SettingsAccordion from "./SettingsAccordion.svelte";
  
    let profile;
    let name = "";
    let picture = "";
  
    async function loadProfile() {
      profile = await getSetting("account");
  
      if (profile) {
        name = profile.name;
        picture = profile.picture;
      }
    }
  
    onMount(loadProfile);
  
    $: canEditProfile =
      profile?.setBy === "system" || profile?.setBy === "user";
  
    $: isDirty =
      name !== profile?.name || picture !== profile?.picture;
  
    async function toggleSubmit() {
      if (!canEditProfile || !isDirty) return;
  
      await setSetting("account", {
        name,
        picture,
        setBy: "user"
      });
  
      await loadProfile(); // 👈 re-sync buffer
    }
  </script>
  

<SettingsAccordion title="Edit Profile">
    <input 
        type="text" 
        bind:value={name} 
        disabled={!canEditProfile}
    />
    
    <div class="photo-grid">
        {#each PROFILE_PHOTOS as photo}
            <button
                type="button"
                class:selected={picture===photo}
                on:click={() => picture = photo}
                disabled={!canEditProfile}
            >
                <img src={photo} alt="Profile Photo option">
            </button>
        {/each}
    </div>

    <button on:click={toggleSubmit} disabled={!canEditProfile || !isDirty}>
        Save
    </button>
</SettingsAccordion>

<style>
.photo-grid {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.photo-grid button {
  border: 2px solid transparent;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  background: none;
}

.photo-grid button.selected {
  border-color: var(--blue-500);
}

.photo-grid img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
</style>