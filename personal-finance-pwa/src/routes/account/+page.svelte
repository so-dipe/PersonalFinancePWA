<script>
    import { googleToken } from "$lib/google";
    import Settings from "$lib/components/Settings.svelte";

    let user = {
        name: "random",
        avatar: "/avatar.png",
        synced: !!googleToken
    };
</script>

<div class="account-page">
    <div class="account-top">
        <img class="avatar" src="/avatar.png" alt="Profile Picture">
        <div class="user-info">
            <h3>{user.name}</h3>
            {#if !user.synced}
                <button class="sync-btn">
                    Sync with Google
                </button>
            {/if}
        </div>
    </div>
    <Settings />
</div>

<style>
    .account-page {
        padding: var(--space-lg);
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }

    .account-top {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        margin-top: 10vh;
        margin-bottom: var(--space-lg);
        font-family: 'Montserrat', sans-serif;
    }


    .account-top .avatar {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
    }


    .user-info h2 {
        font-size: 1.8rem;
        font-weight: 900;
        margin: 0;
    }


    .sync-btn {
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        border-radius: var(--radius-md);
        border: none;
        background: var(--green-900);
        color: white;
        cursor: pointer;
        transition: background 0.2s ease;
    }


    .sync-btn:hover {
        background: var(--green-700);
    }

</style>